import { useQuery } from "@tanstack/react-query";

import { getMaterials } from "../api/getMaterials";

export function useMaterials() {
  return useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });
}
