export class UnsupportedMaterialError extends Error {
    materialId;
    constructor(materialId) {
        super(`Unsupported material: ${materialId}`);
        this.materialId = materialId;
        this.name = "UnsupportedMaterialError";
    }
}
const APPROVED_MATERIALS = [
    {
        id: "birch-plywood-18mm",
        name: "Birch Plywood 18mm",
        description: "Approved cabinet-grade birch plywood sheet goods.",
        sheet: { widthMm: 2440, heightMm: 1220 },
        thicknessMm: 18,
        priceCentsPerSheet: 8900,
        currency: "USD",
    },
    {
        id: "white-melamine-18mm",
        name: "White Melamine 18mm",
        description: "Approved white-faced melamine sheet goods.",
        sheet: { widthMm: 2440, heightMm: 1220 },
        thicknessMm: 18,
        priceCentsPerSheet: 7600,
        currency: "USD",
    },
];
export const DEFAULT_APPROVED_MATERIAL_ID = APPROVED_MATERIALS[0].id;
function cloneMaterial(material) {
    return structuredClone(material);
}
export function listApprovedMaterials() {
    return APPROVED_MATERIALS.map(cloneMaterial);
}
export function getApprovedMaterial(materialId) {
    const material = APPROVED_MATERIALS.find((candidate) => candidate.id === materialId);
    return material ? cloneMaterial(material) : undefined;
}
export function requireApprovedMaterial(materialId) {
    const material = getApprovedMaterial(materialId);
    if (!material) {
        throw new UnsupportedMaterialError(materialId);
    }
    return material;
}
