export type { MaterialCatalogEntry, MaterialSheet } from "@modulewood/domain";
export {
  DEFAULT_APPROVED_MATERIAL_ID,
  getApprovedMaterial,
  listApprovedMaterials,
  requireApprovedMaterial,
  UnsupportedMaterialError,
} from "./catalog.js";
