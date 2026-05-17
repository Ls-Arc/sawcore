import type { CabinetSetup, Workspace } from "@modulewood/domain";

export interface WorkspaceCreateInput {
  readonly id: string;
  readonly name: string;
  readonly cabinetSetup: CabinetSetup;
}

export interface WorkspaceUpdateInput {
  readonly name?: string;
  readonly cabinetSetup?: CabinetSetup;
}

export interface WorkspaceRepository {
  create(workspace: Workspace): Promise<Workspace>;
  read(workspaceId: string): Promise<Workspace | null>;
  update(workspace: Workspace): Promise<Workspace | null>;
  delete(workspaceId: string): Promise<boolean>;
}
