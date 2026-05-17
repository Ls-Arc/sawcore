import type { Workspace } from "@modulewood/domain";

import type {
  WorkspaceCreateInput,
  WorkspaceRepository,
  WorkspaceUpdateInput,
} from "./contracts.js";
import { WorkspaceMissingError } from "./errors.js";

type MutableWorkspace = {
  -readonly [Key in keyof Workspace]: Workspace[Key];
};

function cloneWorkspace(workspace: Workspace): Workspace {
  return structuredClone(workspace);
}

function mergeWorkspace(workspace: Workspace, input: WorkspaceUpdateInput): Workspace {
  const nextWorkspace = structuredClone(workspace) as MutableWorkspace;

  if (input.name !== undefined) {
    nextWorkspace.name = input.name;
  }

  if (input.cabinetSetup !== undefined) {
    nextWorkspace.cabinetSetup = structuredClone(input.cabinetSetup);
  }

  if (input.selectedMaterialId !== undefined) {
    nextWorkspace.selectedMaterialId = input.selectedMaterialId;
  }

  return nextWorkspace;
}

export async function createWorkspace(
  repository: WorkspaceRepository,
  input: WorkspaceCreateInput,
): Promise<Workspace> {
  return repository.create(cloneWorkspace(input));
}

export async function listWorkspaces(
  repository: WorkspaceRepository,
): Promise<Workspace[]> {
  const workspaces = await repository.list();

  return workspaces.map(cloneWorkspace);
}

export async function readWorkspace(
  repository: WorkspaceRepository,
  workspaceId: string,
): Promise<Workspace> {
  const workspace = await repository.read(workspaceId);

  if (!workspace) {
    throw new WorkspaceMissingError(workspaceId);
  }

  return cloneWorkspace(workspace);
}

export async function updateWorkspace(
  repository: WorkspaceRepository,
  workspaceId: string,
  input: WorkspaceUpdateInput,
): Promise<Workspace> {
  const existingWorkspace = await repository.read(workspaceId);

  if (!existingWorkspace) {
    throw new WorkspaceMissingError(workspaceId);
  }

  const nextWorkspace = mergeWorkspace(existingWorkspace, input);
  const savedWorkspace = await repository.update(nextWorkspace);

  if (!savedWorkspace) {
    throw new WorkspaceMissingError(workspaceId);
  }

  return cloneWorkspace(savedWorkspace);
}

export async function deleteWorkspace(
  repository: WorkspaceRepository,
  workspaceId: string,
): Promise<void> {
  const deleted = await repository.delete(workspaceId);

  if (!deleted) {
    throw new WorkspaceMissingError(workspaceId);
  }
}
