export interface ApiResponse<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface Measurement {
  readonly value: number;
  readonly unit: string;
}

export interface CabinetSetup {
  readonly width: Measurement;
  readonly height: Measurement;
  readonly depth: Measurement;
  readonly materialThickness: Measurement;
  readonly allowances: {
    readonly cut: Measurement;
  };
  readonly constructionRules: Record<string, unknown>;
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
