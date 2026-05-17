import { calculateParts, CalculationError } from "@modulewood/core-engine";
import {
  buildCsvExport,
  buildEmptyPreviewModel,
  buildPdfExport,
  buildRoughCostSummary,
  buildPreviewModel,
  type ExportArtifact as PreviewExportArtifact,
  type PreviewModel,
} from "@modulewood/preview-export";
import {
  listApprovedMaterials,
  requireApprovedMaterial,
  type MaterialCatalogEntry,
} from "@modulewood/material-catalog";
import {
  getStarterTemplate,
  listStarterTemplates,
  seedWorkspaceFromTemplate,
} from "@modulewood/template-starters";
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
  readonly selectedMaterialId?: string;
}

export interface ExportArtifact<TBody extends string | Uint8Array> {
  readonly workspaceId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly body: TBody;
}

export interface WebFlow {
  listMaterials(): ReturnType<typeof listApprovedMaterials>;
  listTemplates(): ReturnType<typeof listStarterTemplates>;
  getTemplate(templateId: string): ReturnType<typeof getStarterTemplate>;
  createWorkspaceFromTemplate(
    input: CreateWorkspaceFromTemplateInput,
  ): Promise<Workspace>;
  createWorkspace(
    input: Parameters<typeof createWorkspaceUseCase>[1],
  ): Promise<Workspace>;
  readWorkspace(workspaceId: string): Promise<Workspace>;
  updateWorkspace(
    workspaceId: string,
    input: Parameters<typeof updateWorkspaceUseCase>[2],
  ): Promise<Workspace>;
  deleteWorkspace(workspaceId: string): Promise<void>;
  previewWorkspace(workspaceId: string): Promise<PreviewModel>;
  exportWorkspaceCsv(
    workspaceId: string,
  ): Promise<PreviewExportArtifact<string>>;
  exportWorkspacePdf(
    workspaceId: string,
  ): Promise<PreviewExportArtifact<Uint8Array>>;
}

export interface WebFlowDependencies {
  readonly repository?: WorkspaceRepository;
}

function resolveSelectedMaterial(
  selectedMaterialId?: string,
): MaterialCatalogEntry | undefined {
  if (selectedMaterialId === undefined) {
    return undefined;
  }

  return requireApprovedMaterial(selectedMaterialId);
}

export function createWebFlow(dependencies: WebFlowDependencies = {}): WebFlow {
  const repository =
    dependencies.repository ?? createMemoryWorkspaceRepository();

  return {
    listMaterials: () => listApprovedMaterials(),
    listTemplates: () => listStarterTemplates(),
    getTemplate: (templateId) => getStarterTemplate(templateId),
    createWorkspaceFromTemplate: async (input) => {
      const seededWorkspace = seedWorkspaceFromTemplate(input);
      const selectedMaterial = resolveSelectedMaterial(
        input.selectedMaterialId ?? seededWorkspace.selectedMaterialId,
      );

      return createWorkspaceUseCase(repository, {
        ...seededWorkspace,
        ...(selectedMaterial
          ? { selectedMaterialId: selectedMaterial.id }
          : {}),
      });
    },
    createWorkspace: async (input) => {
      const selectedMaterial = resolveSelectedMaterial(
        input.selectedMaterialId,
      );

      return createWorkspaceUseCase(repository, {
        ...input,
        ...(selectedMaterial
          ? { selectedMaterialId: selectedMaterial.id }
          : {}),
      });
    },
    readWorkspace: async (workspaceId) =>
      readWorkspaceUseCase(repository, workspaceId),
    updateWorkspace: async (workspaceId, input) => {
      const selectedMaterial = resolveSelectedMaterial(
        input.selectedMaterialId,
      );

      return updateWorkspaceUseCase(repository, workspaceId, {
        ...input,
        ...(selectedMaterial
          ? { selectedMaterialId: selectedMaterial.id }
          : {}),
      });
    },
    deleteWorkspace: async (workspaceId) =>
      deleteWorkspaceUseCase(repository, workspaceId),
    previewWorkspace: async (workspaceId) => {
      try {
        const workspace = await readWorkspaceUseCase(repository, workspaceId);
        const result = calculateParts({
          workspaceId: workspace.id,
          cabinet: workspace.cabinetSetup,
        });
        const selectedMaterial = resolveSelectedMaterial(
          workspace.selectedMaterialId,
        );
        const costSummary = buildRoughCostSummary(result, selectedMaterial);

        return buildPreviewModel(result, costSummary);
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
      const workspace = await readWorkspaceUseCase(repository, workspaceId);
      const result = calculateParts({
        workspaceId: workspace.id,
        cabinet: workspace.cabinetSetup,
      });
      const selectedMaterial = resolveSelectedMaterial(
        workspace.selectedMaterialId,
      );
      const costSummary = buildRoughCostSummary(result, selectedMaterial);

      return buildCsvExport(result, costSummary);
    },
    exportWorkspacePdf: async (workspaceId) => {
      const workspace = await readWorkspaceUseCase(repository, workspaceId);
      const result = calculateParts({
        workspaceId: workspace.id,
        cabinet: workspace.cabinetSetup,
      });
      const selectedMaterial = resolveSelectedMaterial(
        workspace.selectedMaterialId,
      );
      const costSummary = buildRoughCostSummary(result, selectedMaterial);

      return buildPdfExport(result, costSummary);
    },
  };
}
