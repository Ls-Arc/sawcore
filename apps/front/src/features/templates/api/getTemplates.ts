import { apiFetch } from "../../../lib/api/client";
import type { StarterTemplate } from "../../../lib/api/types";

export function getTemplates() {
  return apiFetch<StarterTemplate[]>("/api/templates");
}
