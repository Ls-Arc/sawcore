import type { Unit } from "./unit.js";

export interface DimensionInput {
  readonly value: number;
  readonly unit: Unit;
}
