import { apiFetch } from "../../../lib/api/client";
import type { PreviewModel } from "../../../lib/api/types";

export function getWorkspacePreview(id: string) {
  return apiFetch<PreviewModel>(`/api/workspaces/${id}/preview`, {
    method: "POST",
  });
}
