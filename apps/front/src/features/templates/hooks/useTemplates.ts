import { useQuery } from "@tanstack/react-query";

import { getTemplates } from "../api/getTemplates";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });
}
