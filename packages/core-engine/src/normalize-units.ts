import type { CabinetSetup, DimensionInput, Unit } from "@modulewood/domain";

import { CalculationError } from "./validation.js";

export interface NormalizedDimensionInput {
  readonly valueMm: number;
  readonly unit: Unit;
}

export interface NormalizedCabinetSetup {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly depthMm: number;
  readonly materialThicknessMm: number;
  readonly allowanceCutMm: number;
}

const UNIT_FACTORS: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  in: 25.4,
};

const fail = (code: "INVALID_INPUT" | "AMBIGUOUS_UNIT", message: string): never => {
  throw new CalculationError(code, message);
};

export function normalizeDimensionInput(input: DimensionInput, label: string): NormalizedDimensionInput {
  if (input.unit == null) {
    fail("AMBIGUOUS_UNIT", `${label} requires an explicit unit`);
  }

  const factor = UNIT_FACTORS[input.unit];
  if (factor === undefined) {
    fail("INVALID_INPUT", `${label} uses an unsupported unit`);
  }

  return { valueMm: input.value * factor, unit: input.unit };
}

export function normalizeCabinetSetup(setup: CabinetSetup): NormalizedCabinetSetup {
  const width = normalizeDimensionInput(setup.width, "width").valueMm;
  const height = normalizeDimensionInput(setup.height, "height").valueMm;
  const depth = normalizeDimensionInput(setup.depth, "depth").valueMm;
  const materialThickness = normalizeDimensionInput(setup.materialThickness, "materialThickness").valueMm;
  const allowanceCutMm = setup.allowances?.cut ? normalizeDimensionInput(setup.allowances.cut, "allowances.cut").valueMm : 0;

  return {
    widthMm: width,
    heightMm: height,
    depthMm: depth,
    materialThicknessMm: materialThickness,
    allowanceCutMm,
  };
}
