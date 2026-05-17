import type { MaterialCatalogEntry } from "@modulewood/domain";
export declare class UnsupportedMaterialError extends Error {
    readonly materialId: string;
    constructor(materialId: string);
}
export declare const DEFAULT_APPROVED_MATERIAL_ID: "birch-plywood-18mm";
export declare function listApprovedMaterials(): readonly MaterialCatalogEntry[];
export declare function getApprovedMaterial(materialId: string): MaterialCatalogEntry | undefined;
export declare function requireApprovedMaterial(materialId: string): MaterialCatalogEntry;
//# sourceMappingURL=catalog.d.ts.map