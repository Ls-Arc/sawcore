import { useQuery } from "@tanstack/react-query";

import { getWorkspacePreview } from "../api/getWorkspacePreview";
import { workspacePreviewQueryKey } from "../api/workspacePreviewQueryKey";

export function useWorkspacePreview(id: string) {
  return useQuery({
    queryKey: workspacePreviewQueryKey(id),
    queryFn: () => getWorkspacePreview(id),
    enabled: Boolean(id),
  });
}
