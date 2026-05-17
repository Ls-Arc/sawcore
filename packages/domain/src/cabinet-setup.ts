import type { DimensionInput } from "./dimension-input.js";

export interface CabinetAllowanceSet {
  readonly cut?: DimensionInput;
}

export interface CabinetSetup {
  readonly width: DimensionInput;
  readonly height: DimensionInput;
  readonly depth: DimensionInput;
  readonly materialThickness: DimensionInput;
  readonly allowances?: CabinetAllowanceSet;
}
