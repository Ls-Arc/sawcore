import type { CalculatePartsResult, PartLine } from "@modulewood/core-engine";

export interface RoughCostSheet {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface RoughCostMaterial {
  readonly id: string;
  readonly name: string;
  readonly sheet: RoughCostSheet;
  readonly priceCentsPerSheet: number;
  readonly currency: "USD";
}

export interface RoughCostSummary {
  readonly approximate: true;
  readonly materialId: string;
  readonly materialName: string;
  readonly totalAreaMm2: number;
  readonly sheetAreaMm2: number;
  readonly estimatedSheetCount: number;
  readonly estimatedCostCents: number;
  readonly currency: "USD";
}

export interface PreviewPartFrame extends PartLine {
  readonly xMm: number;
  readonly yMm: number;
  readonly displayWidthMm: number;
  readonly displayHeightMm: number;
}

export interface PreviewCanvas {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface PreviewModel {
  readonly workspaceId: string;
  readonly state: "ready" | "empty";
  readonly units: "mm";
  readonly canvas: PreviewCanvas;
  readonly parts: readonly PreviewPartFrame[];
  readonly message?: string;
  readonly costSummary?: RoughCostSummary;
}

export interface ExportArtifact<TBody extends string | Uint8Array> {
  readonly workspaceId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly body: TBody;
  readonly costSummary?: RoughCostSummary;
}

export type CalculationOutput = CalculatePartsResult;

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function buildRoughCostSummary(
  result: CalculationOutput,
  material?: RoughCostMaterial | null,
): RoughCostSummary | undefined {
  if (!material || result.parts.length === 0) {
    return undefined;
  }

  if (
    !isPositiveFinite(material.sheet.widthMm) ||
    !isPositiveFinite(material.sheet.heightMm) ||
    !isPositiveFinite(material.priceCentsPerSheet)
  ) {
    return undefined;
  }

  const sheetAreaMm2 = material.sheet.widthMm * material.sheet.heightMm;

  if (!isPositiveFinite(sheetAreaMm2)) {
    return undefined;
  }

  let totalAreaMm2 = 0;

  for (const part of result.parts) {
    if (!isPositiveFinite(part.lengthMm) || !isPositiveFinite(part.widthMm) || !isPositiveFinite(part.quantity)) {
      return undefined;
    }

    totalAreaMm2 += part.lengthMm * part.widthMm * part.quantity;
  }

  if (!isPositiveFinite(totalAreaMm2)) {
    return undefined;
  }

  const estimatedSheetCount = Math.ceil(totalAreaMm2 / sheetAreaMm2);

  if (!isPositiveFinite(estimatedSheetCount)) {
    return undefined;
  }

  return {
    approximate: true,
    materialId: material.id,
    materialName: material.name,
    totalAreaMm2,
    sheetAreaMm2,
    estimatedSheetCount,
    estimatedCostCents: estimatedSheetCount * material.priceCentsPerSheet,
    currency: material.currency,
  };
}
