import { useQuery } from "@tanstack/react-query";

import { getWorkspace } from "../api/getWorkspace";

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: () => getWorkspace(id),
    enabled: Boolean(id),
  });
}
