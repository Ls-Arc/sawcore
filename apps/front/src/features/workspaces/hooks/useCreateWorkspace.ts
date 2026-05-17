import { useMutation } from "@tanstack/react-query";

import { createWorkspace, type CreateWorkspaceInput } from "../api/createWorkspace";

export function useCreateWorkspace() {
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),
  });
}
