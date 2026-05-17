import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";
import { DEFAULT_APPROVED_MATERIAL_ID, getApprovedMaterial } from "@modulewood/material-catalog";

import { buildCsvExport, buildPdfExport, buildPreviewModel, buildRoughCostSummary } from "@modulewood/preview-export";

import { createWebFlow, createMemoryWorkspaceRepository } from "../src/index.js";

test("web flow wires workspace CRUD, templates, engine, and exports", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  const materials = flow.listMaterials();

  assert.deepStrictEqual(
    flow.listTemplates().map((template) => template.id),
    ["compact-base", "wall-cabinet"],
  );
  assert.equal(materials[0]?.id, DEFAULT_APPROVED_MATERIAL_ID);

  const seeded = await flow.createWorkspaceFromTemplate({
    workspaceId: "workspace-1",
    templateId: "wall-cabinet",
    selectedMaterialId: DEFAULT_APPROVED_MATERIAL_ID,
  });
  assert.equal(seeded.name, "Wall Cabinet");
  assert.equal(seeded.cabinetSetup.depth.value, 35);
  assert.equal(seeded.selectedMaterialId, DEFAULT_APPROVED_MATERIAL_ID);

  const preview = await flow.previewWorkspace("workspace-1");
  const result = calculateParts({ workspaceId: seeded.id, cabinet: seeded.cabinetSetup });
  const material = getApprovedMaterial(DEFAULT_APPROVED_MATERIAL_ID);

  assert.ok(material);

  const expectedSummary = buildRoughCostSummary(result, material);

  assert.deepStrictEqual(preview, buildPreviewModel(result, expectedSummary));
  assert.equal(preview.costSummary?.materialId, DEFAULT_APPROVED_MATERIAL_ID);

  const csv = await flow.exportWorkspaceCsv("workspace-1");
  const pdf = await flow.exportWorkspacePdf("workspace-1");

  assert.deepStrictEqual(csv, buildCsvExport(result, expectedSummary));
  assert.deepStrictEqual(pdf, buildPdfExport(result, expectedSummary));
});

test("web flow rejects unknown selected materials", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  await assert.rejects(
    () =>
      flow.createWorkspaceFromTemplate({
        workspaceId: "workspace-2",
        templateId: "compact-base",
        selectedMaterialId: "missing-material",
      }),
    /Unsupported material: missing-material/,
  );

  await flow.createWorkspaceFromTemplate({ workspaceId: "workspace-3", templateId: "compact-base" });

  await assert.rejects(
    () => flow.updateWorkspace("workspace-3", { selectedMaterialId: "missing-material" }),
    /Unsupported material: missing-material/,
  );
});

test("web flow preserves inset construction rules through preview and export", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  const seeded = await flow.createWorkspace({
    id: "workspace-2",
    name: "Inset cabinet",
    cabinetSetup: {
      width: { value: 100, unit: "cm" },
      height: { value: 200, unit: "cm" },
      depth: { value: 50, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
      constructionRules: {
        backPanelFit: "inset",
        allowances: { backInset: { value: 5, unit: "mm" } },
      },
    },
  });

  assert.equal(seeded.cabinetSetup.constructionRules?.backPanelFit, "inset");

  const result = calculateParts({ workspaceId: seeded.id, cabinet: seeded.cabinetSetup });
  const preview = await flow.previewWorkspace("workspace-2");
  const csv = await flow.exportWorkspaceCsv("workspace-2");
  const pdf = await flow.exportWorkspacePdf("workspace-2");

  assert.deepStrictEqual(preview, buildPreviewModel(result));
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
