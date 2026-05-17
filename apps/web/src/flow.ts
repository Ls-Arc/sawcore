import { calculateParts, CalculationError } from "@modulewood/core-engine";
import {
  buildCsvExport,
  buildEmptyPreviewModel,
  buildPdfExport,
  buildPreviewModel,
  type ExportArtifact as PreviewExportArtifact,
  type PreviewModel,
} from "@modulewood/preview-export";
import { getStarterTemplate, listStarterTemplates, seedWorkspaceFromTemplate } from "@modulewood/template-starters";
import type { Workspace } from "@modulewood/domain";
import {
  createWorkspace as createWorkspaceUseCase,
  deleteWorkspace as deleteWorkspaceUseCase,
  readWorkspace as readWorkspaceUseCase,
  updateWorkspace as updateWorkspaceUseCase,
  type WorkspaceRepository,
  WorkspaceMissingError,
} from "@modulewood/workspace-crud";

import { createMemoryWorkspaceRepository } from "./memory-workspace-repository.js";

export interface CreateWorkspaceFromTemplateInput {
  readonly workspaceId: string;
  readonly templateId: string;
  readonly workspaceName?: string;
}

export interface ExportArtifact<TBody extends string | Uint8Array> {
  readonly workspaceId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly body: TBody;
}

export interface WebFlow {
  listTemplates(): ReturnType<typeof listStarterTemplates>;
  getTemplate(templateId: string): ReturnType<typeof getStarterTemplate>;
  createWorkspaceFromTemplate(input: CreateWorkspaceFromTemplateInput): Promise<Workspace>;
  createWorkspace(input: Parameters<typeof createWorkspaceUseCase>[1]): Promise<Workspace>;
  readWorkspace(workspaceId: string): Promise<Workspace>;
  updateWorkspace(workspaceId: string, input: Parameters<typeof updateWorkspaceUseCase>[2]): Promise<Workspace>;
  deleteWorkspace(workspaceId: string): Promise<void>;
  previewWorkspace(workspaceId: string): Promise<PreviewModel>;
  exportWorkspaceCsv(workspaceId: string): Promise<PreviewExportArtifact<string>>;
  exportWorkspacePdf(workspaceId: string): Promise<PreviewExportArtifact<Uint8Array>>;
}

export interface WebFlowDependencies {
  readonly repository?: WorkspaceRepository;
}

async function resolveCalculation(workspaceId: string, repository: WorkspaceRepository) {
  const workspace = await readWorkspaceUseCase(repository, workspaceId);
  return calculateParts({ workspaceId: workspace.id, cabinet: workspace.cabinetSetup });
}

export function createWebFlow(dependencies: WebFlowDependencies = {}): WebFlow {
  const repository = dependencies.repository ?? createMemoryWorkspaceRepository();

  return {
    listTemplates: () => listStarterTemplates(),
    getTemplate: (templateId) => getStarterTemplate(templateId),
    createWorkspaceFromTemplate: async (input) => {
      const seededWorkspace = seedWorkspaceFromTemplate(input);
      return createWorkspaceUseCase(repository, seededWorkspace);
    },
    createWorkspace: async (input) => createWorkspaceUseCase(repository, input),
    readWorkspace: async (workspaceId) => readWorkspaceUseCase(repository, workspaceId),
    updateWorkspace: async (workspaceId, input) => updateWorkspaceUseCase(repository, workspaceId, input),
    deleteWorkspace: async (workspaceId) => deleteWorkspaceUseCase(repository, workspaceId),
    previewWorkspace: async (workspaceId) => {
      try {
        return buildPreviewModel(await resolveCalculation(workspaceId, repository));
      } catch (error) {
        if (error instanceof WorkspaceMissingError) {
          throw error;
        }

        if (error instanceof CalculationError) {
          return buildEmptyPreviewModel(workspaceId, error.message);
        }

        throw error;
      }
    },
    exportWorkspaceCsv: async (workspaceId) => {
      const result = await resolveCalculation(workspaceId, repository);
      return buildCsvExport(result);
    },
    exportWorkspacePdf: async (workspaceId) => {
      const result = await resolveCalculation(workspaceId, repository);
      return buildPdfExport(result);
    },
  };
}
