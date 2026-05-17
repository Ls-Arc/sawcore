import { useQuery } from "@tanstack/react-query";

import { getWorkspace } from "../api/getWorkspace";
import { workspaceQueryKey } from "../api/workspaceQueryKey";

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: workspaceQueryKey(id),
    queryFn: () => getWorkspace(id),
    enabled: Boolean(id),
  });
}
