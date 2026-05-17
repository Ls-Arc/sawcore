import type { CalculationOutput, ExportArtifact, RoughCostSummary } from "./contracts.js";

function escapeCsv(value: string): string {
  if (/[,"\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function buildCostSummaryRows(costSummary: RoughCostSummary): string[][] {
  return [
    ["roughCostSummary", "approximate", String(costSummary.approximate)],
    ["roughCostSummary", "materialId", costSummary.materialId],
    ["roughCostSummary", "materialName", costSummary.materialName],
    ["roughCostSummary", "totalAreaMm2", String(costSummary.totalAreaMm2)],
    ["roughCostSummary", "sheetAreaMm2", String(costSummary.sheetAreaMm2)],
    ["roughCostSummary", "estimatedSheetCount", String(costSummary.estimatedSheetCount)],
    ["roughCostSummary", "estimatedCostCents", String(costSummary.estimatedCostCents)],
    ["roughCostSummary", "currency", costSummary.currency],
  ];
}

export function buildCsvExport(result: CalculationOutput, costSummary?: RoughCostSummary): ExportArtifact<string> {
  const header = [
    "workspaceId",
    "partId",
    "name",
    "quantity",
    "lengthMm",
    "widthMm",
    "thicknessMm",
    "allowanceMm",
    "units",
  ];

  const rows = result.parts.map((part) => [
    result.workspaceId,
    part.id,
    part.name,
    String(part.quantity),
    String(part.lengthMm),
    String(part.widthMm),
    String(part.thicknessMm),
    String(part.allowanceMm),
    result.units,
  ]);

  if (costSummary) {
    rows.push(...buildCostSummaryRows(costSummary));
  }

  return {
    workspaceId: result.workspaceId,
    filename: `${result.workspaceId}-parts.csv`,
    mimeType: "text/csv; charset=utf-8",
    body: [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n"),
    ...(costSummary ? { costSummary } : {}),
  };
}
