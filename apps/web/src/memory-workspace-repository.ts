import type { Workspace } from "@modulewood/domain";

import type { WorkspaceRepository } from "@modulewood/workspace-crud";

export function createMemoryWorkspaceRepository(): WorkspaceRepository {
  const store = new Map<string, Workspace>();

  return {
    async create(workspace) {
      const nextWorkspace = structuredClone(workspace);
      store.set(nextWorkspace.id, nextWorkspace);
      return structuredClone(nextWorkspace);
    },
    async read(workspaceId) {
      const workspace = store.get(workspaceId);
      return workspace ? structuredClone(workspace) : null;
    },
    async update(workspace) {
      if (!store.has(workspace.id)) {
        return null;
      }

      const nextWorkspace = structuredClone(workspace);
      store.set(nextWorkspace.id, nextWorkspace);
      return structuredClone(nextWorkspace);
    },
    async delete(workspaceId) {
      return store.delete(workspaceId);
    },
  };
}
