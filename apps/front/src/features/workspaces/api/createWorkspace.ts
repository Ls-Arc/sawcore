import { apiFetch } from "../../../lib/api/client";
import type { Workspace } from "../../../lib/api/types";

export interface CreateWorkspaceInput {
  readonly templateId: string;
  readonly workspaceId?: string;
  readonly workspaceName?: string;
  readonly selectedMaterialId?: string;
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return apiFetch<Workspace>("/api/workspaces/from-template", {
    method: "POST",
    body: JSON.stringify({
      workspaceId: input.workspaceId ?? crypto.randomUUID(),
      templateId: input.templateId,
      ...(input.workspaceName ? { workspaceName: input.workspaceName } : {}),
      ...(input.selectedMaterialId
        ? { selectedMaterialId: input.selectedMaterialId }
        : {}),
    }),
  });
}
