import type { CalculationOutput, ExportArtifact } from "./contracts.js";

function escapePdfText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function buildPdfLines(result: CalculationOutput): string[] {
  return [
    `Workspace: ${result.workspaceId}`,
    `Parts: ${result.parts.length}`,
    ...result.parts.map(
      (part) => `${part.id} | ${part.name} | qty ${part.quantity} | ${part.lengthMm}x${part.widthMm} mm`,
    ),
  ];
}

function createPdfDocument(lines: readonly string[]): Uint8Array {
  const contentStream = [
    "BT",
    "/F1 12 Tf",
    "1 0 0 1 50 780 Tm",
    ...lines.flatMap((line, index) => {
      const text = `(${escapePdfText(line)}) Tj`;
      return index === 0 ? [text] : ["0 -16 Td", text];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    `4 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj\n`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
  ];

  const parts = ["%PDF-1.4\n"];
  const offsets = [0];

  for (const object of objects) {
    offsets.push(parts.join("").length);
    parts.push(object);
  }

  const xrefOffset = parts.join("").length;
  const xrefEntries = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];

  for (const offset of offsets.slice(1)) {
    xrefEntries.push(`${offset.toString().padStart(10, "0")} 00000 n `);
  }

  const trailer = [
    "trailer << /Size 6 /Root 1 0 R >>",
    `startxref\n${xrefOffset}`,
    "%%EOF",
  ].join("\n");

  const pdf = [parts.join(""), xrefEntries.join("\n"), trailer].join("\n");
  return new TextEncoder().encode(pdf);
}

export function buildPdfExport(result: CalculationOutput): ExportArtifact<Uint8Array> {
  return {
    workspaceId: result.workspaceId,
    filename: `${result.workspaceId}-parts.pdf`,
    mimeType: "application/pdf",
    body: createPdfDocument(buildPdfLines(result)),
  };
}
