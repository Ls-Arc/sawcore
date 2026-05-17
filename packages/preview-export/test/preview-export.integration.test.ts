import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";
import {
  compactBaseCase,
  starterSeededMaterialSelectedJourney,
  toStablePartFacts,
} from "@modulewood/validation-fixtures";

import {
  buildCsvExport,
  buildEmptyPreviewModel,
  buildPdfExport,
  buildPreviewModel,
  buildRoughCostSummary,
} from "../src/index.js";

test("preview-export builds a 2D model from the shared compact/base case", () => {
  const result = calculateParts({
    workspaceId: compactBaseCase.workspaceId,
    cabinet: compactBaseCase.cabinetSetup,
  });
  const preview = buildPreviewModel(result);

  assert.equal(preview.workspaceId, result.workspaceId);
  assert.equal(preview.state, "ready");
  assert.equal(preview.parts.length, result.parts.length);
  assert.ok(preview.canvas.widthMm > 0);
  assert.ok(preview.canvas.heightMm > 0);
  assert.deepStrictEqual(result.parts.map(toStablePartFacts), compactBaseCase.expected.parts);
});

test("preview-export derives shared journey CSV and PDF facts", () => {
  const result = calculateParts({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    cabinet: starterSeededMaterialSelectedJourney.expectedCreatedWorkspace.cabinetSetup,
  });

  const summary = buildRoughCostSummary(result, starterSeededMaterialSelectedJourney.seedMaterial);

  assert.ok(summary);
  assert.equal(summary.approximate, true);
  assert.equal(summary.materialId, starterSeededMaterialSelectedJourney.seedMaterial.id);
  assert.equal(summary.materialName, starterSeededMaterialSelectedJourney.seedMaterial.name);
  assert.equal(
    summary.sheetAreaMm2,
    starterSeededMaterialSelectedJourney.seedMaterial.sheet.widthMm * starterSeededMaterialSelectedJourney.seedMaterial.sheet.heightMm,
  );
  assert.equal(
    summary.totalAreaMm2,
    result.parts.reduce((total, part) => total + part.lengthMm * part.widthMm * part.quantity, 0),
  );
  assert.equal(summary.estimatedSheetCount, 1);
  assert.equal(summary.estimatedCostCents, starterSeededMaterialSelectedJourney.seedMaterial.priceCentsPerSheet);

  const preview = buildPreviewModel(result, summary);
  const csv = buildCsvExport(result, summary);
  const pdf = buildPdfExport(result, summary);

  assert.equal(preview.workspaceId, starterSeededMaterialSelectedJourney.workspaceId);
  assert.equal(preview.state, starterSeededMaterialSelectedJourney.expectedCreatedPreview.state);
  assert.equal(preview.units, starterSeededMaterialSelectedJourney.expectedCreatedPreview.units);
  assert.equal(preview.canvas.widthMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.widthMm);
  assert.equal(preview.canvas.heightMm, starterSeededMaterialSelectedJourney.expectedCreatedPreview.canvas.heightMm);
  assert.equal(preview.parts.length, starterSeededMaterialSelectedJourney.expectedCreatedPreview.partCount);
  assert.equal(preview.costSummary?.materialId, starterSeededMaterialSelectedJourney.expectedCreatedPreview.costSummaryMaterialId);
  assert.match(csv.body, new RegExp(starterSeededMaterialSelectedJourney.expectedExports.csvContains[0]));
  assert.match(csv.body, new RegExp(starterSeededMaterialSelectedJourney.expectedExports.csvContains[1]));
  assert.match(csv.body, new RegExp(starterSeededMaterialSelectedJourney.expectedExports.csvContains[2]));
  assert.match(new TextDecoder().decode(pdf.body), new RegExp(starterSeededMaterialSelectedJourney.expectedExports.pdfContains[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(new TextDecoder().decode(pdf.body), new RegExp(starterSeededMaterialSelectedJourney.expectedExports.pdfContains[1]));
  assert.match(new TextDecoder().decode(pdf.body), new RegExp(starterSeededMaterialSelectedJourney.expectedExports.pdfContains[2]));
});

test("preview-export skips rough cost summaries when the input is incomplete", () => {
  const result = calculateParts({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    cabinet: starterSeededMaterialSelectedJourney.expectedCreatedWorkspace.cabinetSetup,
  });

  assert.equal(buildRoughCostSummary({ ...result, parts: [] }, starterSeededMaterialSelectedJourney.seedMaterial), undefined);
  assert.equal(buildRoughCostSummary(result, { ...starterSeededMaterialSelectedJourney.seedMaterial, sheet: { widthMm: 0, heightMm: starterSeededMaterialSelectedJourney.seedMaterial.sheet.heightMm } }), undefined);
});

test("preview-export provides a non-breaking empty model", () => {
  const preview = buildEmptyPreviewModel("workspace-2");

  assert.equal(preview.state, "empty");
  assert.equal(preview.parts.length, 0);
  assert.equal(preview.canvas.widthMm, 0);
});

test("preview-export produces CSV and PDF artifacts from the same engine result", () => {
  const result = calculateParts({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    cabinet: starterSeededMaterialSelectedJourney.expectedCreatedWorkspace.cabinetSetup,
  });

  const summary = buildRoughCostSummary(result, starterSeededMaterialSelectedJourney.seedMaterial);
  const csv = buildCsvExport(result, summary);
  const pdf = buildPdfExport(result, summary);

  assert.equal(csv.mimeType, "text/csv; charset=utf-8");
  assert.match(csv.body, /validation-starter-journey/);
  assert.match(csv.body, /roughCostSummary/);
  assert.equal(pdf.mimeType, "application/pdf");
  assert.match(new TextDecoder().decode(pdf.body), /^%PDF-1\.4/);
  assert.match(new TextDecoder().decode(pdf.body), /Rough cost summary/);
});
