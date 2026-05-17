import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteWorkspace } from "../api/deleteWorkspace";
import { workspacePreviewQueryKey } from "../api/workspacePreviewQueryKey";
import { workspaceQueryKey } from "../api/workspaceQueryKey";

export function useDeleteWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteWorkspace(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceQueryKey(id), exact: true });
      queryClient.removeQueries({ queryKey: workspacePreviewQueryKey(id), exact: true });
    },
  });
}
