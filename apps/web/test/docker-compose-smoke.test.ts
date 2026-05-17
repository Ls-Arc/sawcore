import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

type DockerComposeResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

type DockerSpawnSync = (...args: Parameters<typeof spawnSync>) => DockerComposeResult;

const dockerProcess: { spawnSync: DockerSpawnSync } = {
  spawnSync: (...args) => {
    const result = spawnSync(...args);

    return {
      status: result.status,
      stdout: typeof result.stdout === "string" ? result.stdout : result.stdout?.toString("utf8") ?? "",
      stderr: typeof result.stderr === "string" ? result.stderr : result.stderr?.toString("utf8") ?? "",
    };
  },
};

function findRepoRoot(startDirectory: string): string {
  let current = startDirectory;

  while (current !== dirname(current)) {
    if (existsSync(join(current, "infra", "docker-compose.yml"))) {
      return current;
    }

    current = dirname(current);
  }

  throw new Error("Unable to locate the repository root");
}

const repoRoot = findRepoRoot(fileURLToPath(new URL(".", import.meta.url)));
const composeFile = join(repoRoot, "infra", "docker-compose.yml");
const shouldRunDockerE2E = process.env.DOCKER_SMOKE_E2E === "true" || !process.env.CI;

function runDockerCompose(args: string[]): void {
  const result = dockerProcess.spawnSync("docker", ["compose", "-f", composeFile, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      HOST_PORT: process.env.HOST_PORT ?? "3000",
    },
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `docker compose ${args.join(" ")} failed`);
  }
}

test("docker compose start failure is visible", () => {
  const originalSpawnSync = dockerProcess.spawnSync;
  dockerProcess.spawnSync = () => ({
    status: 1,
    stdout: "",
    stderr: "missing prerequisite: docker daemon unavailable",
  });

  try {
    assert.throws(() => runDockerCompose(["up", "-d"]), /missing prerequisite: docker daemon unavailable/);
  } finally {
    dockerProcess.spawnSync = originalSpawnSync;
  }
});

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

async function waitForHealth(url: string): Promise<Response> {
  const deadline = Date.now() + 90_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // keep waiting for the container to become healthy
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

if (shouldRunDockerE2E) {
  test("docker compose starts the approved v0.1 flow only", { timeout: 300000 }, async () => {
    const projectName = "modulewood-smoke";
    const hostPort = await getFreePort();

    process.env.HOST_PORT = String(hostPort);

    runDockerCompose(["-p", projectName, "up", "-d", "--build"]);

    try {
      const baseUrl = `http://127.0.0.1:${hostPort}`;
      const health = await waitForHealth(`${baseUrl}/health`);
      assert.equal(health.status, 200);

      const templates = await fetch(`${baseUrl}/api/templates`);
      assert.equal(templates.status, 200);

      const materials = await fetch(`${baseUrl}/api/materials`);
      assert.equal(materials.status, 200);

      const createResponse = await fetch(`${baseUrl}/api/workspaces/from-template`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "workspace-1",
          templateId: "compact-base",
          selectedMaterialId: "birch-plywood-18mm",
        }),
      });

      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as { data: { selectedMaterialId?: string } };
      assert.equal(created.data.selectedMaterialId, "birch-plywood-18mm");

      const invalidCreate = await fetch(`${baseUrl}/api/workspaces/from-template`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "workspace-2",
          templateId: "compact-base",
          selectedMaterialId: "missing-material",
        }),
      });

      assert.equal(invalidCreate.status, 422);

      const preview = await fetch(`${baseUrl}/api/workspaces/workspace-1/preview`, { method: "POST" });
      assert.equal(preview.status, 200);
      const previewJson = (await preview.json()) as { data: { costSummary?: { materialId: string } } };
      assert.equal(previewJson.data.costSummary?.materialId, "birch-plywood-18mm");

      const csv = await fetch(`${baseUrl}/api/workspaces/workspace-1/export/csv`, { method: "POST" });
      assert.equal(csv.status, 200);
      const csvText = await csv.text();
      assert.match(csvText, /workspace-1/);
      assert.match(csvText, /roughCostSummary/);

      const pdf = await fetch(`${baseUrl}/api/workspaces/workspace-1/export/pdf`, { method: "POST" });
      assert.equal(pdf.status, 200);
      assert.match(new TextDecoder().decode(await pdf.arrayBuffer()), /^%PDF-1\.4/);

      const forbidden = await fetch(`${baseUrl}/api/cloud`);
      assert.equal(forbidden.status, 404);
    } finally {
      runDockerCompose(["-p", projectName, "down", "-v", "--remove-orphans"]);
    }
  });
}
