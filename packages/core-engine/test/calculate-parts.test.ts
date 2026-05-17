import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts, CalculationError } from "../src/index.js";

const validInput = {
  workspaceId: "workspace-1",
  cabinet: {
    width: { value: 100, unit: "cm" },
    height: { value: 200, unit: "cm" },
    depth: { value: 50, unit: "cm" },
    materialThickness: { value: 18, unit: "mm" },
    allowances: { cut: { value: 2, unit: "mm" } },
  },
} as const;

test("calculateParts is deterministic for the same valid input", () => {
  const first = calculateParts(validInput);
  const second = calculateParts(validInput);

  assert.deepStrictEqual(second, first);
  assert.equal(first.allowancesApplied, true);
  assert.equal(first.units, "mm");
});

test("calculateParts rejects invalid dimensions", () => {
  assert.throws(
    () =>
      calculateParts({
        ...validInput,
        cabinet: {
          ...validInput.cabinet,
          width: { value: -1, unit: "cm" },
        },
      }),
    (error: unknown) => error instanceof CalculationError && error.code === "INVALID_INPUT",
  );
});

test("calculateParts rejects ambiguous units", () => {
  assert.throws(
    () =>
      calculateParts({
        ...validInput,
        cabinet: {
          ...validInput.cabinet,
          depth: { value: 50 },
        },
      } as never),
    (error: unknown) => error instanceof CalculationError && error.code === "AMBIGUOUS_UNIT",
  );
});
