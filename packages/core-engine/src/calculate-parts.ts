import type { CabinetSetup } from "@modulewood/domain";

import { normalizeCabinetSetup } from "./normalize-units.js";
import { CalculationError, validateCalculatePartsInput } from "./validation.js";

export interface CalculatePartsInput {
  readonly workspaceId: string;
  readonly cabinet: CabinetSetup;
}

export interface PartLine {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly allowanceMm: number;
}

export interface CalculatePartsResult {
  readonly workspaceId: string;
  readonly parts: readonly PartLine[];
  readonly allowancesApplied: boolean;
  readonly units: "mm";
}

const ensurePositivePartDimension = (value: number, label: string): number => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new CalculationError("INVALID_INPUT", `${label} must remain positive after allowances`);
  }

  return value;
};

export function calculateParts(input: CalculatePartsInput): CalculatePartsResult {
  validateCalculatePartsInput(input);
  const normalized = normalizeCabinetSetup(input.cabinet);

  const thickness = normalized.materialThicknessMm;
  const cutAllowance = normalized.allowanceCutMm;
  const backInsetAllowance = normalized.constructionRules.backInsetMm;
  const backPanelFit = normalized.constructionRules.backPanelFit;
  const width = normalized.widthMm;
  const height = normalized.heightMm;
  const depth = normalized.depthMm;

  const sideHeight = ensurePositivePartDimension(height - cutAllowance, "side height");
  const sideDepth = ensurePositivePartDimension(depth, "side depth");
  const panelWidth = ensurePositivePartDimension(width - thickness * 2 - cutAllowance, "panel width");
  const panelHeight = ensurePositivePartDimension(height - cutAllowance, "panel height");
  const backPanelWidth =
    backPanelFit === "overlay"
      ? ensurePositivePartDimension(width - cutAllowance, "back panel width")
      : ensurePositivePartDimension(width - thickness * 2 - cutAllowance - backInsetAllowance * 2, "back panel width");
  const backPanelHeight =
    backPanelFit === "overlay"
      ? ensurePositivePartDimension(height - cutAllowance, "back panel height")
      : ensurePositivePartDimension(height - cutAllowance - backInsetAllowance * 2, "back panel height");
  const backPanelAllowance = cutAllowance + (backPanelFit === "overlay" ? 0 : backInsetAllowance);

  const parts: PartLine[] = [
    {
      id: "side-left",
      name: "Left side",
      quantity: 1,
      lengthMm: sideHeight,
      widthMm: sideDepth,
      thicknessMm: thickness,
      allowanceMm: cutAllowance,
    },
    {
      id: "side-right",
      name: "Right side",
      quantity: 1,
      lengthMm: sideHeight,
      widthMm: sideDepth,
      thicknessMm: thickness,
      allowanceMm: cutAllowance,
    },
    {
      id: "top",
      name: "Top",
      quantity: 1,
      lengthMm: panelWidth,
      widthMm: sideDepth,
      thicknessMm: thickness,
      allowanceMm: cutAllowance,
    },
    {
      id: "bottom",
      name: "Bottom",
      quantity: 1,
      lengthMm: panelWidth,
      widthMm: sideDepth,
      thicknessMm: thickness,
      allowanceMm: cutAllowance,
    },
    {
      id: "back",
      name: "Back",
      quantity: 1,
      lengthMm: backPanelWidth,
      widthMm: backPanelHeight,
      thicknessMm: thickness,
      allowanceMm: backPanelAllowance,
    },
  ];

  return {
    workspaceId: input.workspaceId,
    parts,
    allowancesApplied: cutAllowance > 0,
    units: "mm",
  };
}

export { CalculationError } from "./validation.js";
