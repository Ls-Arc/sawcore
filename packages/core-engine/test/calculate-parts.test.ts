import assert from "node:assert/strict";
import test from "node:test";

import { calculateParts, CalculationError } from "../src/index.js";

const baseInput = {
  workspaceId: "workspace-1",
  cabinet: {
    width: { value: 100, unit: "cm" },
    height: { value: 200, unit: "cm" },
    depth: { value: 50, unit: "cm" },
    materialThickness: { value: 18, unit: "mm" },
  },
} as const;

test("calculateParts is deterministic for the same valid input", () => {
  const first = calculateParts(baseInput);
  const second = calculateParts(baseInput);

  assert.deepStrictEqual(second, first);
  assert.equal(first.allowancesApplied, true);
  assert.equal(first.units, "mm");
  assert.deepStrictEqual(first.parts.find((part) => part.id === "back"), {
    id: "back",
    name: "Back",
    quantity: 1,
    lengthMm: 998,
    widthMm: 1998,
    thicknessMm: 18,
    allowanceMm: 2,
  });
});

test("calculateParts rejects invalid dimensions", () => {
  assert.throws(
    () =>
      calculateParts({
        ...baseInput,
        cabinet: {
          ...baseInput.cabinet,
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
        ...baseInput,
        cabinet: {
          ...baseInput.cabinet,
          depth: { value: 50 },
        },
      } as never),
    (error: unknown) => error instanceof CalculationError && error.code === "AMBIGUOUS_UNIT",
  );
});

test("calculateParts defaults missing construction rules to overlay", () => {
  const defaulted = calculateParts(baseInput);
  const explicitOverlay = calculateParts({
    ...baseInput,
    cabinet: {
      ...baseInput.cabinet,
      allowances: { cut: { value: 2, unit: "mm" } },
      constructionRules: {
        backPanelFit: "overlay",
        allowances: { cut: { value: 2, unit: "mm" } },
      },
    },
  });

  assert.deepStrictEqual(defaulted, explicitOverlay);
});

test("calculateParts supports inset back panels", () => {
  const result = calculateParts({
    ...baseInput,
    cabinet: {
      ...baseInput.cabinet,
      constructionRules: {
        backPanelFit: "inset",
        allowances: {
          backInset: { value: 5, unit: "mm" },
        },
      },
    },
  });

  assert.deepStrictEqual(result.parts.find((part) => part.id === "back"), {
    id: "back",
    name: "Back",
    quantity: 1,
    lengthMm: 952,
    widthMm: 1988,
    thicknessMm: 18,
    allowanceMm: 7,
  });
});

test("calculateParts rejects unsupported construction rule values", () => {
  assert.throws(
    () =>
      calculateParts({
        ...baseInput,
        cabinet: {
          ...baseInput.cabinet,
          constructionRules: {
            backPanelFit: "flush" as never,
          },
        },
      }),
    (error: unknown) => error instanceof CalculationError && error.code === "INVALID_INPUT",
  );
});
