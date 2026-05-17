import type { CabinetSetup, Workspace } from "@modulewood/domain";
import { DEFAULT_CONSTRUCTION_RULES } from "@modulewood/domain";

export interface StablePartFacts {
  readonly id: string;
  readonly quantity: number;
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly allowanceMm: number;
}

export interface StableCalculationFacts {
  readonly allowancesApplied: boolean;
  readonly units: "mm";
  readonly partCount: number;
  readonly parts: readonly StablePartFacts[];
}

export interface StableMaterialFacts {
  readonly id: string;
  readonly name: string;
  readonly sheet: {
    readonly widthMm: number;
    readonly heightMm: number;
  };
  readonly priceCentsPerSheet: number;
  readonly currency: "USD";
}

export interface RealWorldCabinetCase {
  readonly id: string;
  readonly workspaceId: string;
  readonly cabinetSetup: CabinetSetup;
  readonly expected: StableCalculationFacts;
}

export interface RealWorldJourneyFixture {
  readonly workspaceId: string;
  readonly templateId: "wall-cabinet";
  readonly templateIds: readonly ["compact-base", "wall-cabinet"];
  readonly seedMaterial: StableMaterialFacts;
  readonly updatedMaterial: StableMaterialFacts;
  readonly initialSelectedMaterialId: string;
  readonly updateWorkspaceInput: {
    readonly name: string;
    readonly selectedMaterialId: string;
    readonly cabinetSetup: CabinetSetup;
  };
  readonly expectedCreatedWorkspace: Workspace;
  readonly expectedUpdatedWorkspace: Workspace;
  readonly expectedCreatedPreview: {
    readonly state: "ready";
    readonly units: "mm";
    readonly partCount: number;
    readonly canvas: {
      readonly widthMm: number;
      readonly heightMm: number;
    };
    readonly costSummaryMaterialId: string;
  };
  readonly expectedExports: {
    readonly csvContains: readonly string[];
    readonly pdfContains: readonly string[];
  };
  readonly invalidMaterialId: string;
  readonly missingRoutePath: string;
}

interface StablePartLike {
  readonly id: string;
  readonly quantity: number;
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly allowanceMm: number;
}

interface StableCalculationLike {
  readonly allowancesApplied: boolean;
  readonly units: "mm";
  readonly parts: readonly StablePartLike[];
}

export function toStablePartFacts(part: StablePartLike): StablePartFacts {
  return {
    id: part.id,
    quantity: part.quantity,
    lengthMm: part.lengthMm,
    widthMm: part.widthMm,
    thicknessMm: part.thicknessMm,
    allowanceMm: part.allowanceMm,
  };
}

export function toStableCalculationFacts(result: StableCalculationLike): StableCalculationFacts {
  return {
    allowancesApplied: result.allowancesApplied,
    units: result.units,
    partCount: result.parts.length,
    parts: result.parts.map(toStablePartFacts),
  };
}

const compactBaseCabinetSetup = {
  width: { value: 80, unit: "cm" },
  height: { value: 72, unit: "cm" },
  depth: { value: 56, unit: "cm" },
  materialThickness: { value: 18, unit: "mm" },
  allowances: { cut: { value: 2, unit: "mm" } },
  constructionRules: structuredClone(DEFAULT_CONSTRUCTION_RULES),
} as const satisfies CabinetSetup;

const wallCabinetCabinetSetup = {
  width: { value: 80, unit: "cm" },
  height: { value: 72, unit: "cm" },
  depth: { value: 35, unit: "cm" },
  materialThickness: { value: 18, unit: "mm" },
  allowances: { cut: { value: 2, unit: "mm" } },
  constructionRules: structuredClone(DEFAULT_CONSTRUCTION_RULES),
} as const satisfies CabinetSetup;

const insetBackCabinetSetup = {
  width: { value: 100, unit: "cm" },
  height: { value: 200, unit: "cm" },
  depth: { value: 50, unit: "cm" },
  materialThickness: { value: 18, unit: "mm" },
  constructionRules: {
    backPanelFit: "inset",
    allowances: {
      backInset: { value: 5, unit: "mm" },
    },
  },
} as const satisfies CabinetSetup;

const starterJourneyUpdatedCabinetSetup = {
  width: { value: 90, unit: "cm" },
  height: { value: 72, unit: "cm" },
  depth: { value: 35, unit: "cm" },
  materialThickness: { value: 18, unit: "mm" },
  allowances: { cut: { value: 2, unit: "mm" } },
  constructionRules: {
    backPanelFit: "inset",
    allowances: {
      backInset: { value: 4, unit: "mm" },
    },
  },
} as const satisfies CabinetSetup;

export const compactBaseCase = {
  id: "compact-base",
  workspaceId: "validation-compact-base",
  cabinetSetup: compactBaseCabinetSetup,
  expected: {
    allowancesApplied: true,
    units: "mm",
    partCount: 5,
    parts: [
      { id: "side-left", quantity: 1, lengthMm: 718, widthMm: 560, thicknessMm: 18, allowanceMm: 2 },
      { id: "side-right", quantity: 1, lengthMm: 718, widthMm: 560, thicknessMm: 18, allowanceMm: 2 },
      { id: "top", quantity: 1, lengthMm: 762, widthMm: 560, thicknessMm: 18, allowanceMm: 2 },
      { id: "bottom", quantity: 1, lengthMm: 762, widthMm: 560, thicknessMm: 18, allowanceMm: 2 },
      { id: "back", quantity: 1, lengthMm: 798, widthMm: 718, thicknessMm: 18, allowanceMm: 2 },
    ],
  },
} as const satisfies RealWorldCabinetCase;

// Wall cabinet proves the same engine math stays deterministic for a shallow starter.
export const wallCabinetCase = {
  id: "wall-cabinet",
  workspaceId: "validation-wall-cabinet",
  cabinetSetup: wallCabinetCabinetSetup,
  expected: {
    allowancesApplied: true,
    units: "mm",
    partCount: 5,
    parts: [
      { id: "side-left", quantity: 1, lengthMm: 718, widthMm: 350, thicknessMm: 18, allowanceMm: 2 },
      { id: "side-right", quantity: 1, lengthMm: 718, widthMm: 350, thicknessMm: 18, allowanceMm: 2 },
      { id: "top", quantity: 1, lengthMm: 762, widthMm: 350, thicknessMm: 18, allowanceMm: 2 },
      { id: "bottom", quantity: 1, lengthMm: 762, widthMm: 350, thicknessMm: 18, allowanceMm: 2 },
      { id: "back", quantity: 1, lengthMm: 798, widthMm: 718, thicknessMm: 18, allowanceMm: 2 },
    ],
  },
} as const satisfies RealWorldCabinetCase;

// Inset-back proves the alternate construction rule path without changing runtime behavior.
export const insetBackCase = {
  id: "inset-back",
  workspaceId: "validation-inset-back",
  cabinetSetup: insetBackCabinetSetup,
  expected: {
    allowancesApplied: true,
    units: "mm",
    partCount: 5,
    parts: [
      { id: "side-left", quantity: 1, lengthMm: 1998, widthMm: 500, thicknessMm: 18, allowanceMm: 2 },
      { id: "side-right", quantity: 1, lengthMm: 1998, widthMm: 500, thicknessMm: 18, allowanceMm: 2 },
      { id: "top", quantity: 1, lengthMm: 962, widthMm: 500, thicknessMm: 18, allowanceMm: 2 },
      { id: "bottom", quantity: 1, lengthMm: 962, widthMm: 500, thicknessMm: 18, allowanceMm: 2 },
      { id: "back", quantity: 1, lengthMm: 952, widthMm: 1988, thicknessMm: 18, allowanceMm: 7 },
    ],
  },
} as const satisfies RealWorldCabinetCase;

// Starter-seeded journey proves the same shared data can drive CRUD, preview, CSV, PDF, and HTTP.
export const starterSeededMaterialSelectedJourney = {
  workspaceId: "validation-starter-journey",
  templateId: "wall-cabinet",
  templateIds: ["compact-base", "wall-cabinet"],
  seedMaterial: {
    id: "birch-plywood-18mm",
    name: "Birch Plywood 18mm",
    sheet: { widthMm: 2440, heightMm: 1220 },
    priceCentsPerSheet: 8900,
    currency: "USD",
  },
  updatedMaterial: {
    id: "white-melamine-18mm",
    name: "White Melamine 18mm",
    sheet: { widthMm: 2440, heightMm: 1220 },
    priceCentsPerSheet: 7600,
    currency: "USD",
  },
  initialSelectedMaterialId: "birch-plywood-18mm",
  updateWorkspaceInput: {
    name: "Wall Cabinet v2",
    selectedMaterialId: "white-melamine-18mm",
    cabinetSetup: starterJourneyUpdatedCabinetSetup,
  },
  expectedCreatedWorkspace: {
    id: "validation-starter-journey",
    name: "Wall Cabinet",
    selectedMaterialId: "birch-plywood-18mm",
    cabinetSetup: wallCabinetCabinetSetup,
  },
  expectedUpdatedWorkspace: {
    id: "validation-starter-journey",
    name: "Wall Cabinet v2",
    selectedMaterialId: "white-melamine-18mm",
    cabinetSetup: starterJourneyUpdatedCabinetSetup,
  },
  expectedCreatedPreview: {
    state: "ready",
    units: "mm",
    partCount: 5,
    canvas: {
      widthMm: 846,
      heightMm: 3686,
    },
    costSummaryMaterialId: "birch-plywood-18mm",
  },
  expectedExports: {
    csvContains: ["validation-starter-journey", "roughCostSummary", "birch-plywood-18mm"],
    pdfContains: ["Workspace: validation-starter-journey", "Rough cost summary", "Birch Plywood 18mm"],
  },
  invalidMaterialId: "missing-material",
  missingRoutePath: "/api/cloud",
} as const satisfies RealWorldJourneyFixture;

export const realWorldValidationPack = {
  cabinetCases: [compactBaseCase, wallCabinetCase, insetBackCase],
  starterJourney: starterSeededMaterialSelectedJourney,
} as const;
