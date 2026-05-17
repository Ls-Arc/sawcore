import { apiFetch } from "../../../lib/api/client";
import type { Workspace, WorkspaceUpdateInput } from "../../../lib/api/types";

export function updateWorkspace(id: string, input: WorkspaceUpdateInput) {
  return apiFetch<Workspace>(`/api/workspaces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
