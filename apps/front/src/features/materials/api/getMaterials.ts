import { apiFetch } from "../../../lib/api/client";
import type { MaterialCatalogEntry } from "../../../lib/api/types";

export function getMaterials() {
  return apiFetch<MaterialCatalogEntry[]>("/api/materials");
}
