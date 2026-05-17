import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";

import { buildCsvExport, buildPdfExport, buildPreviewModel } from "@modulewood/preview-export";

import { createWebFlow, createMemoryWorkspaceRepository } from "../src/index.js";

test("web flow wires workspace CRUD, templates, engine, and exports", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  const seeded = await flow.createWorkspaceFromTemplate({ workspaceId: "workspace-1", templateId: "compact-base" });
  assert.equal(seeded.name, "Compact Base");

  const preview = await flow.previewWorkspace("workspace-1");
  const result = calculateParts({ workspaceId: seeded.id, cabinet: seeded.cabinetSetup });

  assert.deepStrictEqual(preview, buildPreviewModel(result));

  const csv = await flow.exportWorkspaceCsv("workspace-1");
  const pdf = await flow.exportWorkspacePdf("workspace-1");

  assert.deepStrictEqual(csv, buildCsvExport(result));
  assert.deepStrictEqual(pdf, buildPdfExport(result));
});

test("web flow keeps preview non-breaking when the engine rejects input", async () => {
  const repository = createMemoryWorkspaceRepository();
  const flow = createWebFlow({ repository });

  await flow.createWorkspace({
    id: "workspace-2",
    name: "Incomplete",
    cabinetSetup: {
      width: { value: 100, unit: "cm" },
      height: { value: 200, unit: "cm" },
      depth: { value: 50, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
      allowances: { cut: { value: -1, unit: "mm" } },
    },
  });

  const preview = await flow.previewWorkspace("workspace-2");

  assert.equal(preview.state, "empty");
  assert.equal(preview.parts.length, 0);
  await assert.rejects(() => flow.exportWorkspaceCsv("workspace-2"));
  await assert.rejects(() => flow.exportWorkspacePdf("workspace-2"));
});
