import type { CalculationOutput, ExportArtifact } from "./contracts.js";

function escapeCsv(value: string): string {
  if (/[,"\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function buildCsvExport(result: CalculationOutput): ExportArtifact<string> {
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

  return {
    workspaceId: result.workspaceId,
    filename: `${result.workspaceId}-parts.csv`,
    mimeType: "text/csv; charset=utf-8",
    body: [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n"),
  };
}
