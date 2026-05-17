import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";

import {
  buildCsvExport,
  buildEmptyPreviewModel,
  buildPdfExport,
  buildPreviewModel,
  buildRoughCostSummary,
} from "../src/index.js";

const material = {
  id: "birch-plywood-18mm",
  name: "Birch Plywood 18mm",
  sheet: { widthMm: 2440, heightMm: 1220 },
  priceCentsPerSheet: 8900,
  currency: "USD",
} as const;

const workspace = {
  id: "workspace-1",
  cabinetSetup: {
    width: { value: 80, unit: "cm" },
    height: { value: 72, unit: "cm" },
    depth: { value: 35, unit: "cm" },
    materialThickness: { value: 18, unit: "mm" },
    allowances: { cut: { value: 2, unit: "mm" } },
    constructionRules: {
      backPanelFit: "overlay",
      allowances: {},
    },
  },
} as const;

test("preview-export builds a 2D model from engine output only", () => {
  const result = calculateParts({ workspaceId: workspace.id, cabinet: workspace.cabinetSetup });
  const preview = buildPreviewModel(result);

  assert.equal(preview.workspaceId, result.workspaceId);
  assert.equal(preview.state, "ready");
  assert.equal(preview.parts.length, result.parts.length);
  assert.ok(preview.canvas.widthMm > 0);
  assert.ok(preview.canvas.heightMm > 0);
});

test("preview-export derives an approximate rough cost summary from the engine output", () => {
  const result = calculateParts({ workspaceId: workspace.id, cabinet: workspace.cabinetSetup });

  const summary = buildRoughCostSummary(result, material);

  assert.ok(summary);
  assert.equal(summary.approximate, true);
  assert.equal(summary.materialId, material.id);
  assert.equal(summary.materialName, material.name);
  assert.equal(summary.sheetAreaMm2, material.sheet.widthMm * material.sheet.heightMm);
  assert.equal(
    summary.totalAreaMm2,
    result.parts.reduce((total, part) => total + part.lengthMm * part.widthMm * part.quantity, 0),
  );
  assert.equal(summary.estimatedSheetCount, 1);
  assert.equal(summary.estimatedCostCents, material.priceCentsPerSheet);
});

test("preview-export skips rough cost summaries when the input is incomplete", () => {
  const result = calculateParts({ workspaceId: workspace.id, cabinet: workspace.cabinetSetup });

  assert.equal(buildRoughCostSummary({ ...result, parts: [] }, material), undefined);
  assert.equal(
    buildRoughCostSummary(result, { ...material, sheet: { widthMm: 0, heightMm: material.sheet.heightMm } }),
    undefined,
  );
});

test("preview-export provides a non-breaking empty model", () => {
  const preview = buildEmptyPreviewModel("workspace-2");

  assert.equal(preview.state, "empty");
  assert.equal(preview.parts.length, 0);
  assert.equal(preview.canvas.widthMm, 0);
});

test("preview-export produces CSV and PDF artifacts from the same engine result", () => {
  const result = calculateParts({ workspaceId: workspace.id, cabinet: workspace.cabinetSetup });

  const summary = buildRoughCostSummary(result, material);
  const csv = buildCsvExport(result, summary);
  const pdf = buildPdfExport(result, summary);

  assert.equal(csv.mimeType, "text/csv; charset=utf-8");
  assert.match(csv.body, /workspace-1/);
  assert.match(csv.body, /roughCostSummary/);
  assert.equal(pdf.mimeType, "application/pdf");
  assert.match(new TextDecoder().decode(pdf.body), /^%PDF-1\.4/);
  assert.match(new TextDecoder().decode(pdf.body), /Rough cost summary/);
});
