import type { CalculationOutput, PreviewModel, PreviewPartFrame } from "./contracts.js";

const CANVAS_MARGIN_MM = 24;
const ROW_GAP_MM = 12;

function layoutPartFrame(part: CalculationOutput["parts"][number], index: number): PreviewPartFrame {
  const displayWidthMm = part.lengthMm;
  const displayHeightMm = part.widthMm;
  const yMm = CANVAS_MARGIN_MM + index * (displayHeightMm + ROW_GAP_MM);

  return {
    ...part,
    xMm: CANVAS_MARGIN_MM,
    yMm,
    displayWidthMm,
    displayHeightMm,
  };
}

export function buildPreviewModel(result: CalculationOutput): PreviewModel {
  const parts = result.parts.map(layoutPartFrame);
  const widestPart = parts.reduce((maximum, part) => Math.max(maximum, part.xMm + part.displayWidthMm), CANVAS_MARGIN_MM);
  const tallestPart = parts.reduce((maximum, part) => Math.max(maximum, part.yMm + part.displayHeightMm), CANVAS_MARGIN_MM);

  return {
    workspaceId: result.workspaceId,
    state: "ready",
    units: "mm",
    canvas: {
      widthMm: widestPart + CANVAS_MARGIN_MM,
      heightMm: tallestPart + CANVAS_MARGIN_MM,
    },
    parts,
  };
}

export function buildEmptyPreviewModel(workspaceId: string, message = "No complete cabinet setup yet."): PreviewModel {
  return {
    workspaceId,
    state: "empty",
    units: "mm",
    canvas: {
      widthMm: 0,
      heightMm: 0,
    },
    parts: [],
    message,
  };
}
