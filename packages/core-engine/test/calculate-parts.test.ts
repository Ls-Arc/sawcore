import assert from "node:assert/strict";
import test from "node:test";

import {
  compactBaseCase,
  insetBackCase,
  wallCabinetCase,
  toStablePartFacts,
} from "@modulewood/validation-fixtures";

import { calculateParts, CalculationError } from "../src/index.js";

test("calculateParts is deterministic for the same valid input", () => {
  const first = calculateParts({ workspaceId: compactBaseCase.workspaceId, cabinet: compactBaseCase.cabinetSetup });
  const second = calculateParts({ workspaceId: compactBaseCase.workspaceId, cabinet: compactBaseCase.cabinetSetup });

  assert.deepStrictEqual(second, first);
  assert.equal(first.allowancesApplied, compactBaseCase.expected.allowancesApplied);
  assert.equal(first.units, compactBaseCase.expected.units);
  assert.deepStrictEqual(first.parts.map(toStablePartFacts), compactBaseCase.expected.parts);
});

test("calculateParts is deterministic for the wall cabinet case", () => {
  const first = calculateParts({ workspaceId: wallCabinetCase.workspaceId, cabinet: wallCabinetCase.cabinetSetup });
  const second = calculateParts({ workspaceId: wallCabinetCase.workspaceId, cabinet: wallCabinetCase.cabinetSetup });

  assert.deepStrictEqual(second, first);
  assert.equal(first.allowancesApplied, wallCabinetCase.expected.allowancesApplied);
  assert.equal(first.units, wallCabinetCase.expected.units);
  assert.deepStrictEqual(first.parts.map(toStablePartFacts), wallCabinetCase.expected.parts);
});

test("calculateParts rejects invalid dimensions", () => {
  assert.throws(
    () =>
      calculateParts({
        workspaceId: compactBaseCase.workspaceId,
        cabinet: {
          ...compactBaseCase.cabinetSetup,
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
        workspaceId: compactBaseCase.workspaceId,
        cabinet: {
          ...compactBaseCase.cabinetSetup,
          depth: { value: 50 },
        },
      } as never),
    (error: unknown) => error instanceof CalculationError && error.code === "AMBIGUOUS_UNIT",
  );
});

test("calculateParts defaults missing construction rules to overlay", () => {
  const defaulted = calculateParts({ workspaceId: compactBaseCase.workspaceId, cabinet: compactBaseCase.cabinetSetup });
  const explicitOverlay = calculateParts({
    workspaceId: compactBaseCase.workspaceId,
    cabinet: {
      ...compactBaseCase.cabinetSetup,
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
    workspaceId: insetBackCase.workspaceId,
    cabinet: insetBackCase.cabinetSetup,
  });

  assert.deepStrictEqual(result.parts.map(toStablePartFacts), insetBackCase.expected.parts);
});

test("calculateParts rejects unsupported construction rule values", () => {
  assert.throws(
    () =>
      calculateParts({
        workspaceId: wallCabinetCase.workspaceId,
        cabinet: {
          ...wallCabinetCase.cabinetSetup,
          constructionRules: {
            backPanelFit: "flush" as never,
          },
        },
      }),
    (error: unknown) => error instanceof CalculationError && error.code === "INVALID_INPUT",
  );
});
