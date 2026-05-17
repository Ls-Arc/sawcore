import type { CabinetSetup, DimensionInput } from "@modulewood/domain";

export type CalculationErrorCode = "INVALID_INPUT" | "AMBIGUOUS_UNIT";

export class CalculationError extends Error {
  readonly code: CalculationErrorCode;

  constructor(code: CalculationErrorCode, message: string) {
    super(message);
    this.name = "CalculationError";
    this.code = code;
  }
}

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const fail = (code: CalculationErrorCode, message: string): never => {
  throw new CalculationError(code, message);
};

export function validateDimensionInput(input: DimensionInput, label: string): void {
  if (!isObjectLike(input)) {
    fail("INVALID_INPUT", `${label} must be an object`);
  }

  if (typeof input.value !== "number" || Number.isNaN(input.value) || !Number.isFinite(input.value)) {
    fail("INVALID_INPUT", `${label} must contain a finite numeric value`);
  }

  if (input.value <= 0) {
    fail("INVALID_INPUT", `${label} must be greater than zero`);
  }
}

export function validateCabinetSetup(setup: CabinetSetup): void {
  if (!isObjectLike(setup)) {
    fail("INVALID_INPUT", "cabinet setup must be an object");
  }

  validateDimensionInput(setup.width, "width");
  validateDimensionInput(setup.height, "height");
  validateDimensionInput(setup.depth, "depth");
  validateDimensionInput(setup.materialThickness, "materialThickness");

  if (setup.allowances?.cut !== undefined) {
    validateDimensionInput(setup.allowances.cut, "allowances.cut");
  }
}

export function validateCalculatePartsInput(input: { workspaceId: string; cabinet: CabinetSetup }): void {
  if (!isObjectLike(input)) {
    fail("INVALID_INPUT", "calculation input must be an object");
  }

  if (typeof input.workspaceId !== "string" || input.workspaceId.trim().length === 0) {
    fail("INVALID_INPUT", "workspaceId must be a non-empty string");
  }

  validateCabinetSetup(input.cabinet);
}
