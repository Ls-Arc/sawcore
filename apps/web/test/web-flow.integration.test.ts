import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";
import { buildCsvExport, buildPdfExport, buildPreviewModel, buildRoughCostSummary } from "@modulewood/preview-export";
import { starterSeededMaterialSelectedJourney } from "@modulewood/validation-fixtures";

import { createWebFlow, createMemoryWorkspaceRepository } from "../src/index.js";

test("web flow wires workspace CRUD, templates, engine, and exports", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  const materials = flow.listMaterials();

  assert.deepStrictEqual(
    flow.listTemplates().map((template) => template.id),
    starterSeededMaterialSelectedJourney.templateIds,
  );
  assert.equal(materials[0]?.id, starterSeededMaterialSelectedJourney.seedMaterial.id);

  const seeded = await flow.createWorkspaceFromTemplate({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    templateId: starterSeededMaterialSelectedJourney.templateId,
    selectedMaterialId: starterSeededMaterialSelectedJourney.initialSelectedMaterialId,
  });
  assert.deepStrictEqual(seeded, starterSeededMaterialSelectedJourney.expectedCreatedWorkspace);

  const preview = await flow.previewWorkspace(starterSeededMaterialSelectedJourney.workspaceId);
  const result = calculateParts({ workspaceId: seeded.id, cabinet: seeded.cabinetSetup });

  const expectedSummary = buildRoughCostSummary(result, starterSeededMaterialSelectedJourney.seedMaterial);

  assert.deepStrictEqual(preview, buildPreviewModel(result, expectedSummary));
  assert.equal(preview.state, starterSeededMaterialSelectedJourney.expectedCreatedPreview.state);
  assert.equal(preview.parts.length, starterSeededMaterialSelectedJourney.expectedCreatedPreview.partCount);
  assert.equal(preview.canvas.widthMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.widthMm);
  assert.equal(preview.canvas.heightMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.heightMm);
  assert.equal(preview.costSummary?.materialId, starterSeededMaterialSelectedJourney.expectedCreatedPreview.costSummaryMaterialId);

  const csv = await flow.exportWorkspaceCsv(starterSeededMaterialSelectedJourney.workspaceId);
  const pdf = await flow.exportWorkspacePdf(starterSeededMaterialSelectedJourney.workspaceId);

  assert.deepStrictEqual(csv, buildCsvExport(result, expectedSummary));
  assert.deepStrictEqual(pdf, buildPdfExport(result, expectedSummary));
  assert.match(csv.body, /roughCostSummary/);
  assert.match(new TextDecoder().decode(pdf.body), /Rough cost summary/);
});

test("web flow lists persisted workspaces through the configured repository", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  await flow.createWorkspace({
    id: "workspace-a",
    name: "Alpha",
    cabinetSetup: {
      width: { value: 100, unit: "cm" },
      height: { value: 200, unit: "cm" },
      depth: { value: 50, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
    },
  });
  await flow.createWorkspace({
    id: "workspace-b",
    name: "Beta",
    cabinetSetup: {
      width: { value: 100, unit: "cm" },
      height: { value: 200, unit: "cm" },
      depth: { value: 50, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
    },
  });

  assert.deepStrictEqual((await flow.listWorkspaces()).map((workspace) => workspace.id), ["workspace-a", "workspace-b"]);
});

test("web flow rejects unknown selected materials", async () => {
  const flow = createWebFlow({ repository: createMemoryWorkspaceRepository() });

  await assert.rejects(
    () =>
      flow.createWorkspaceFromTemplate({
        workspaceId: "workspace-2",
        templateId: starterSeededMaterialSelectedJourney.templateIds[0],
        selectedMaterialId: "missing-material",
      }),
    /Unsupported material: missing-material/,
  );

  await flow.createWorkspaceFromTemplate({ workspaceId: "workspace-3", templateId: starterSeededMaterialSelectedJourney.templateIds[0] });

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
