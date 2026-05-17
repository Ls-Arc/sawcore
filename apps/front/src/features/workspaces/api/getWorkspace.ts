import { apiFetch } from "../../../lib/api/client";
import type { Workspace } from "../../../lib/api/types";

export function getWorkspace(id: string) {
  return apiFetch<Workspace>(`/api/workspaces/${id}`);
}
