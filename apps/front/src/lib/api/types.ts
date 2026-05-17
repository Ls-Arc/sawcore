export interface ApiResponse<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface Measurement {
  readonly value: number;
  readonly unit: Unit;
}

export type Unit = "mm" | "cm" | "in";

export interface ConstructionRulesAllowances {
  readonly cut?: Measurement;
  readonly backInset?: Measurement;
}

export interface ConstructionRules {
  readonly backPanelFit?: "overlay" | "inset";
  readonly allowances?: ConstructionRulesAllowances;
}

export interface CabinetAllowances {
  readonly cut?: Measurement;
}

export interface CabinetSetup {
  readonly width: Measurement;
  readonly height: Measurement;
  readonly depth: Measurement;
  readonly materialThickness: Measurement;
  readonly allowances?: CabinetAllowances;
  readonly constructionRules?: ConstructionRules;
}

export interface MaterialCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sheet: {
    readonly widthMm: number;
    readonly heightMm: number;
  };
  readonly thicknessMm: number;
  readonly priceCentsPerSheet: number;
  readonly currency: "USD";
}

export interface StarterTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cabinetSetup: CabinetSetup;
}

export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly cabinetSetup: CabinetSetup;
  readonly selectedMaterialId?: string;
}

export interface WorkspaceUpdateInput {
  readonly name?: string;
  readonly cabinetSetup?: CabinetSetup;
  readonly selectedMaterialId?: string;
}

export type WorkspaceExportFormat = "csv" | "pdf";

export interface RoughCostSummary {
  readonly approximate: true;
  readonly materialId: string;
  readonly materialName: string;
  readonly totalAreaMm2: number;
  readonly sheetAreaMm2: number;
  readonly estimatedSheetCount: number;
  readonly estimatedCostCents: number;
  readonly currency: "USD";
}

export interface PreviewPartFrame {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly lengthMm: number;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly allowanceMm: number;
  readonly xMm: number;
  readonly yMm: number;
  readonly displayWidthMm: number;
  readonly displayHeightMm: number;
}

export interface PreviewModel {
  readonly workspaceId: string;
  readonly state: "ready" | "empty";
  readonly units: "mm";
  readonly canvas: {
    readonly widthMm: number;
    readonly heightMm: number;
  };
  readonly parts: readonly PreviewPartFrame[];
  readonly message?: string;
  readonly costSummary?: RoughCostSummary;
}
