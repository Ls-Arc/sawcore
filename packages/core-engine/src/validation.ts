import type { CabinetSetup, ConstructionRules } from "@modulewood/domain";

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
  typeof value === "object" && value !== null && !Array.isArray(value);

const fail = (code: CalculationErrorCode, message: string): never => {
  throw new CalculationError(code, message);
};

const hasOnlyKeys = (value: Record<string, unknown>, allowedKeys: readonly string[]): boolean =>
  Object.keys(value).every((key) => allowedKeys.includes(key));

function validateConstructionRulesAllowances(allowances: unknown): void {
  if (allowances === undefined) {
    return;
  }

  if (!isObjectLike(allowances) || !hasOnlyKeys(allowances, ["cut", "backInset"])) {
    fail("INVALID_INPUT", "constructionRules.allowances contains unsupported fields");
  }

  const normalizedAllowances = allowances as Record<string, unknown>;

  if (normalizedAllowances.cut !== undefined) {
    validateDimensionInput(normalizedAllowances.cut, "constructionRules.allowances.cut");
  }

  if (normalizedAllowances.backInset !== undefined) {
    validateDimensionInput(normalizedAllowances.backInset, "constructionRules.allowances.backInset");
  }
}

function validateCabinetAllowances(allowances: unknown): void {
  if (allowances === undefined) {
    return;
  }

  if (!isObjectLike(allowances) || !hasOnlyKeys(allowances, ["cut"])) {
    fail("INVALID_INPUT", "allowances contains unsupported fields");
  }

  const normalizedAllowances = allowances as Record<string, unknown>;

  if (normalizedAllowances.cut !== undefined) {
    validateDimensionInput(normalizedAllowances.cut, "allowances.cut");
  }
}

function validateConstructionRules(rules: ConstructionRules | undefined): void {
  if (rules === undefined) {
    return;
  }

  if (!isObjectLike(rules) || !hasOnlyKeys(rules, ["backPanelFit", "allowances"])) {
    fail("INVALID_INPUT", "constructionRules contains unsupported fields");
  }

  if (rules.backPanelFit !== undefined && rules.backPanelFit !== "overlay" && rules.backPanelFit !== "inset") {
    fail("INVALID_INPUT", "constructionRules.backPanelFit must be overlay or inset");
  }

  validateConstructionRulesAllowances(rules.allowances);
}

export function validateDimensionInput(input: unknown, label: string): void {
  if (!isObjectLike(input)) {
    fail("INVALID_INPUT", `${label} must be an object`);
  }

  const normalizedInput = input as Record<string, unknown>;
  const value = normalizedInput.value;

  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    fail("INVALID_INPUT", `${label} must contain a finite numeric value`);
  }

  const numericValue = value as number;

  if (numericValue <= 0) {
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

  validateCabinetAllowances(setup.allowances);

  validateConstructionRules(setup.constructionRules);
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
