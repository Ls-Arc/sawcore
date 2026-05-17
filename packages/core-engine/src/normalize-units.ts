import type { BackPanelFit, CabinetSetup, ConstructionRules, DimensionInput, Unit } from "@modulewood/domain";
import { DEFAULT_CONSTRUCTION_RULES } from "@modulewood/domain";

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
  readonly constructionRules: NormalizedConstructionRules;
}

export interface NormalizedConstructionRules {
  readonly backPanelFit: BackPanelFit;
  readonly allowanceCutMm: number;
  readonly backInsetMm: number;
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

function normalizeConstructionRules(rules: ConstructionRules | undefined, allowanceCutMm: number): NormalizedConstructionRules {
  const mergedRules = {
    ...DEFAULT_CONSTRUCTION_RULES,
    ...(rules ?? {}),
    allowances: {
      ...DEFAULT_CONSTRUCTION_RULES.allowances,
      ...(rules?.allowances ?? {}),
    },
  };

  return {
    backPanelFit: mergedRules.backPanelFit ?? DEFAULT_CONSTRUCTION_RULES.backPanelFit,
    allowanceCutMm,
    backInsetMm: mergedRules.allowances?.backInset
      ? normalizeDimensionInput(mergedRules.allowances.backInset, "constructionRules.allowances.backInset").valueMm
      : 0,
  };
}

export function normalizeCabinetSetup(setup: CabinetSetup): NormalizedCabinetSetup {
  const width = normalizeDimensionInput(setup.width, "width").valueMm;
  const height = normalizeDimensionInput(setup.height, "height").valueMm;
  const depth = normalizeDimensionInput(setup.depth, "depth").valueMm;
  const materialThickness = normalizeDimensionInput(setup.materialThickness, "materialThickness").valueMm;
  const cutAllowanceInput =
    setup.constructionRules?.allowances?.cut ??
    setup.allowances?.cut ??
    DEFAULT_CONSTRUCTION_RULES.allowances.cut;
  const allowanceCutMm = normalizeDimensionInput(cutAllowanceInput, "allowances.cut").valueMm;
  const constructionRules = normalizeConstructionRules(setup.constructionRules, allowanceCutMm);

  return {
    widthMm: width,
    heightMm: height,
    depthMm: depth,
    materialThicknessMm: materialThickness,
    allowanceCutMm,
    constructionRules,
  };
}
