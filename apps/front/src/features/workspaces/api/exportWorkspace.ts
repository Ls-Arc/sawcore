import { API_URL } from "../../../lib/api/config";
import { downloadResponseFile } from "../../../lib/api/download";
import type { WorkspaceExportFormat } from "../../../lib/api/types";

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function workspaceExportBaseName(workspaceName: string, workspaceId: string) {
  const safeName = sanitizeFilenamePart(workspaceName);
  return safeName || `workspace-${workspaceId}`;
}

function workspaceExportFilename(workspaceName: string, workspaceId: string, format: WorkspaceExportFormat) {
  return `${workspaceExportBaseName(workspaceName, workspaceId)}.${format}`;
}

export async function exportWorkspace(id: string, workspaceName: string, format: WorkspaceExportFormat) {
  const response = await fetch(`${API_URL}/api/workspaces/${id}/export`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ format }),
  });

  if (!response.ok) {
    const errorMessage = await response.text().catch(() => "");
    throw new Error(errorMessage || `No se pudo exportar el workspace en formato ${format}.`);
  }

  await downloadResponseFile(response, workspaceExportFilename(workspaceName, id, format));
}
