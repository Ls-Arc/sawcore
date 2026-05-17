import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_APPROVED_MATERIAL_ID,
  getApprovedMaterial,
  listApprovedMaterials,
  requireApprovedMaterial,
  UnsupportedMaterialError,
} from "../src/index.js";

test("approved material catalog is immutable across lookups", () => {
  const firstList = listApprovedMaterials();
  const secondList = listApprovedMaterials();

  assert.notStrictEqual(firstList, secondList);
  assert.notStrictEqual(firstList[0], secondList[0]);
  assert.equal(firstList.length, 2);

  const material = firstList[0];
  assert.ok(material);

  const mutableMaterial = material as { name: string; sheet: { widthMm: number } };
  mutableMaterial.name = "Tampered";
  mutableMaterial.sheet.widthMm = 1;

  const refreshed = listApprovedMaterials();
  const refreshedMaterial = refreshed[0];
  assert.ok(refreshedMaterial);
  assert.equal(refreshedMaterial.name, "Birch Plywood 18mm");
  assert.equal(refreshedMaterial.sheet.widthMm, 2440);
});

test("approved material lookup returns stable copies and rejects unknown ids", () => {
  const material = getApprovedMaterial(DEFAULT_APPROVED_MATERIAL_ID);

  assert.ok(material);
  assert.equal(material.id, DEFAULT_APPROVED_MATERIAL_ID);
  assert.notStrictEqual(material, getApprovedMaterial(DEFAULT_APPROVED_MATERIAL_ID));
  assert.equal(getApprovedMaterial("missing-material"), undefined);
  assert.throws(() => requireApprovedMaterial("missing-material"), UnsupportedMaterialError);
});
