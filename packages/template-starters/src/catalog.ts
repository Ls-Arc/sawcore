import type { CabinetSetup, Workspace } from "@modulewood/domain";

export interface StarterTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cabinetSetup: CabinetSetup;
}

export interface SeedWorkspaceFromTemplateInput {
  readonly workspaceId: string;
  readonly templateId: string;
  readonly workspaceName?: string;
}

export class UnsupportedStarterTemplateError extends Error {
  constructor(public readonly templateId: string) {
    super(`Unsupported starter template: ${templateId}`);
    this.name = "UnsupportedStarterTemplateError";
  }
}

const STARTER_TEMPLATES = [
  {
    id: "compact-base",
    name: "Compact Base",
    description: "Small base cabinet starter for quick layout work.",
    cabinetSetup: {
      width: { value: 80, unit: "cm" },
      height: { value: 72, unit: "cm" },
      depth: { value: 56, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
      allowances: { cut: { value: 2, unit: "mm" } },
    },
  },
  {
    id: "tall-pantry",
    name: "Tall Pantry",
    description: "Narrow tall cabinet starter for storage-heavy spaces.",
    cabinetSetup: {
      width: { value: 60, unit: "cm" },
      height: { value: 210, unit: "cm" },
      depth: { value: 60, unit: "cm" },
      materialThickness: { value: 18, unit: "mm" },
      allowances: { cut: { value: 2, unit: "mm" } },
    },
  },
] as const satisfies readonly StarterTemplate[];

function cloneCabinetSetup(cabinetSetup: CabinetSetup): CabinetSetup {
  return structuredClone(cabinetSetup);
}

function cloneTemplate(template: StarterTemplate): StarterTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    cabinetSetup: cloneCabinetSetup(template.cabinetSetup),
  };
}

export function listStarterTemplates(): readonly StarterTemplate[] {
  return STARTER_TEMPLATES.map(cloneTemplate);
}

export function getStarterTemplate(templateId: string): StarterTemplate | undefined {
  const template = STARTER_TEMPLATES.find((candidate) => candidate.id === templateId);

  return template ? cloneTemplate(template) : undefined;
}

export function requireStarterTemplate(templateId: string): StarterTemplate {
  const template = getStarterTemplate(templateId);

  if (!template) {
    throw new UnsupportedStarterTemplateError(templateId);
  }

  return template;
}

export function seedWorkspaceFromTemplate(input: SeedWorkspaceFromTemplateInput): Workspace {
  const template = requireStarterTemplate(input.templateId);

  return {
    id: input.workspaceId,
    name: input.workspaceName ?? template.name,
    cabinetSetup: cloneCabinetSetup(template.cabinetSetup),
  };
}
