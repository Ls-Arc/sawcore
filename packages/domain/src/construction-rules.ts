import type { DimensionInput } from "./dimension-input.js";

export type BackPanelFit = "overlay" | "inset";

export interface ConstructionRulesAllowances {
  readonly cut?: DimensionInput;
  readonly backInset?: DimensionInput;
}

export interface ConstructionRules {
  readonly backPanelFit?: BackPanelFit;
  readonly allowances?: ConstructionRulesAllowances;
}

export const DEFAULT_CONSTRUCTION_RULES = {
  backPanelFit: "overlay",
  allowances: {
    cut: { value: 2, unit: "mm" },
  },
} as const satisfies ConstructionRules;
