import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { createWebFlow, createSqliteWorkspaceRepository, createWebServer } from "../src/index.js";
import { starterSeededMaterialSelectedJourney } from "@modulewood/validation-fixtures";

function createTempDatabasePath(testName: string): string {
  const directory = mkdtempSync(join(tmpdir(), `modulewood-${testName}-`));
  return join(directory, "workspace.sqlite");
}

async function getFreePort(): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (typeof address === "object" && address && "port" in address) {
        const port = address.port;
        server.close(() => resolve(port));
        return;
      }

      server.close(() => reject(new Error("Unable to allocate a free port")));
    });
  });
}

test("HTTP API serves the shared journey and rejects invalid frozen inputs", async () => {
  const server = createWebServer();
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    const flowResponse = await fetch(`${baseUrl}/api/flow`);
    assert.equal(flowResponse.status, 200);
    const flowJson = (await flowResponse.json()) as { data: { endpoints: readonly string[] } };
    assert.ok(flowJson.data.endpoints.includes("POST /api/workspaces/from-template"));

    const createResponse = await fetch(`${baseUrl}/api/workspaces/from-template`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
        templateId: starterSeededMaterialSelectedJourney.templateId,
        selectedMaterialId: starterSeededMaterialSelectedJourney.initialSelectedMaterialId,
      }),
    });

    assert.equal(createResponse.status, 201);
    const created = (await createResponse.json()) as { data: { selectedMaterialId?: string } };
    assert.equal(created.data.selectedMaterialId, starterSeededMaterialSelectedJourney.initialSelectedMaterialId);

    const invalidCreate = await fetch(`${baseUrl}/api/workspaces/from-template`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: `${starterSeededMaterialSelectedJourney.workspaceId}-invalid`,
        templateId: starterSeededMaterialSelectedJourney.templateId,
        selectedMaterialId: starterSeededMaterialSelectedJourney.invalidMaterialId,
      }),
    });
    assert.equal(invalidCreate.status, 422);

    const preview = await fetch(`${baseUrl}/api/workspaces/${starterSeededMaterialSelectedJourney.workspaceId}/preview`, { method: "POST" });
    assert.equal(preview.status, 200);
    const previewJson = (await preview.json()) as { data: { state: string; canvas: { widthMm: number; heightMm: number }; costSummary?: { materialId: string } } };
    assert.equal(previewJson.data.state, starterSeededMaterialSelectedJourney.expectedCreatedPreview.state);
    assert.equal(previewJson.data.canvas.widthMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.widthMm);
    assert.equal(previewJson.data.canvas.heightMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.heightMm);
    assert.equal(previewJson.data.costSummary?.materialId, starterSeededMaterialSelectedJourney.expectedCreatedPreview.costSummaryMaterialId);

    const csv = await fetch(`${baseUrl}/api/workspaces/${starterSeededMaterialSelectedJourney.workspaceId}/export/csv`, { method: "POST" });
    assert.equal(csv.status, 200);
    const csvText = await csv.text();
    for (const token of starterSeededMaterialSelectedJourney.expectedExports.csvContains) {
      assert.match(csvText, new RegExp(token));
    }

    const pdf = await fetch(`${baseUrl}/api/workspaces/${starterSeededMaterialSelectedJourney.workspaceId}/export/pdf`, { method: "POST" });
    assert.equal(pdf.status, 200);
    const pdfText = new TextDecoder().decode(await pdf.arrayBuffer());
    for (const token of starterSeededMaterialSelectedJourney.expectedExports.pdfContains) {
      assert.match(pdfText, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }

    const notFound = await fetch(`${baseUrl}${starterSeededMaterialSelectedJourney.missingRoutePath}`);
    assert.equal(notFound.status, 404);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("HTTP API lists persisted workspaces and survives a restart", async () => {
  const databasePath = createTempDatabasePath("http-workspace-list");
  const repository = createSqliteWorkspaceRepository({ databasePath });
  const flow = createWebFlow({ repository });
  const server = createWebServer(flow);
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    const createResponse = await fetch(`${baseUrl}/api/workspaces/from-template`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: "workspace-a",
        templateId: starterSeededMaterialSelectedJourney.templateId,
        selectedMaterialId: starterSeededMaterialSelectedJourney.initialSelectedMaterialId,
      }),
    });

    assert.equal(createResponse.status, 201);

    const listResponse = await fetch(`${baseUrl}/api/workspaces`);
    assert.equal(listResponse.status, 200);
    const listed = (await listResponse.json()) as { data: readonly { id: string }[] };
    assert.deepStrictEqual(listed.data.map((workspace) => workspace.id), ["workspace-a"]);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  const restartedServer = createWebServer(createWebFlow({ repository: createSqliteWorkspaceRepository({ databasePath }) }));
  const restartedPort = await getFreePort();
  const restartedBaseUrl = `http://127.0.0.1:${restartedPort}`;

  await new Promise<void>((resolve) => restartedServer.listen(restartedPort, resolve));

  try {
    const listResponse = await fetch(`${restartedBaseUrl}/api/workspaces`);
    assert.equal(listResponse.status, 200);
    const listed = (await listResponse.json()) as { data: readonly { id: string }[] };
    assert.deepStrictEqual(listed.data.map((workspace) => workspace.id), ["workspace-a"]);

    const flowResponse = await fetch(`${restartedBaseUrl}/api/flow`);
    const flowJson = (await flowResponse.json()) as { data: { endpoints: readonly string[] } };
    assert.ok(flowJson.data.endpoints.includes("GET /api/workspaces"));
  } finally {
    await new Promise<void>((resolve) => restartedServer.close(() => resolve()));
    rmSync(databasePath, { force: true });
    rmSync(dirname(databasePath), { force: true, recursive: true });
  }
});

test("HTTP API returns an empty workspace collection before anything is created", async () => {
  const databasePath = createTempDatabasePath("http-workspace-list-empty");
  const repository = createSqliteWorkspaceRepository({ databasePath });
  const server = createWebServer(createWebFlow({ repository }));
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    const listResponse = await fetch(`${baseUrl}/api/workspaces`);

    assert.equal(listResponse.status, 200);
    assert.deepStrictEqual((await listResponse.json()) as { data: readonly unknown[] }, { ok: true, data: [] });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(databasePath, { force: true });
    rmSync(dirname(databasePath), { force: true, recursive: true });
  }
});

test("HTTP API preserves workspace list order across repeated requests", async () => {
  const databasePath = createTempDatabasePath("http-workspace-list-order");
  const repository = createSqliteWorkspaceRepository({ databasePath });
  const server = createWebServer(createWebFlow({ repository }));
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    for (const workspaceId of ["workspace-b", "workspace-a"]) {
      const createResponse = await fetch(`${baseUrl}/api/workspaces/from-template`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          templateId: starterSeededMaterialSelectedJourney.templateId,
          selectedMaterialId: starterSeededMaterialSelectedJourney.initialSelectedMaterialId,
        }),
      });

      assert.equal(createResponse.status, 201);
    }

    const firstListResponse = await fetch(`${baseUrl}/api/workspaces`);
    const secondListResponse = await fetch(`${baseUrl}/api/workspaces`);

    assert.equal(firstListResponse.status, 200);
    assert.equal(secondListResponse.status, 200);

    const firstListed = (await firstListResponse.json()) as { data: readonly { id: string }[] };
    const secondListed = (await secondListResponse.json()) as { data: readonly { id: string }[] };

    assert.equal(firstListed.data.length, 2);
    assert.deepStrictEqual(firstListed.data, secondListed.data);
    assert.deepStrictEqual(
      firstListed.data.map((workspace) => workspace.id),
      ["workspace-b", "workspace-a"],
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(databasePath, { force: true });
    rmSync(dirname(databasePath), { force: true, recursive: true });
  }
});
