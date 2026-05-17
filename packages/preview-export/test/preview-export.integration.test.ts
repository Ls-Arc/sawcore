import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts } from "@modulewood/core-engine";

import { buildCsvExport, buildEmptyPreviewModel, buildPdfExport, buildPreviewModel } from "../src/index.js";

const workspace = {
  workspaceId: "workspace-1",
  cabinet: {
    width: { value: 100, unit: "cm" },
    height: { value: 200, unit: "cm" },
    depth: { value: 50, unit: "cm" },
    materialThickness: { value: 18, unit: "mm" },
    allowances: { cut: { value: 2, unit: "mm" } },
  },
} as const;

test("preview-export builds a 2D model from engine output only", () => {
  const result = calculateParts(workspace);
  const preview = buildPreviewModel(result);

  assert.equal(preview.workspaceId, result.workspaceId);
  assert.equal(preview.state, "ready");
  assert.equal(preview.parts.length, result.parts.length);
  assert.ok(preview.canvas.widthMm > 0);
  assert.ok(preview.canvas.heightMm > 0);
});

test("preview-export provides a non-breaking empty model", () => {
  const preview = buildEmptyPreviewModel("workspace-2");

  assert.equal(preview.state, "empty");
  assert.equal(preview.parts.length, 0);
  assert.equal(preview.canvas.widthMm, 0);
});

test("preview-export produces CSV and PDF artifacts from the same engine result", () => {
  const result = calculateParts(workspace);
  const csv = buildCsvExport(result);
  const pdf = buildPdfExport(result);

  assert.equal(csv.mimeType, "text/csv; charset=utf-8");
  assert.match(csv.body, /workspace-1/);
  assert.equal(pdf.mimeType, "application/pdf");
  assert.match(new TextDecoder().decode(pdf.body), /^%PDF-1\.4/);
});
