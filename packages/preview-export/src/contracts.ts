import type { CalculatePartsResult, PartLine } from "@modulewood/core-engine";

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
}

export interface ExportArtifact<TBody extends string | Uint8Array> {
  readonly workspaceId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly body: TBody;
}

export type CalculationOutput = CalculatePartsResult;
