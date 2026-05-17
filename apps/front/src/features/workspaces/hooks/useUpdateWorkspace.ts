import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateWorkspace } from "../api/updateWorkspace";
import { workspacePreviewQueryKey } from "../api/workspacePreviewQueryKey";
import { workspaceQueryKey } from "../api/workspaceQueryKey";
import type { WorkspaceUpdateInput } from "../../../lib/api/types";

export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkspaceUpdateInput) => updateWorkspace(id, input),
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspaceQueryKey(id), workspace);
      queryClient.invalidateQueries({ queryKey: workspacePreviewQueryKey(id) });
    },
  });
}
