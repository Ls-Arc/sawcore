import assert from "node:assert/strict";
import test from "node:test";

import { seedWorkspaceFromTemplate } from "@modulewood/template-starters";

import {
  createWorkspace,
  deleteWorkspace,
  readWorkspace,
  updateWorkspace,
  WorkspaceMissingError,
  type WorkspaceRepository,
} from "../src/index.js";

function createMemoryRepository(): WorkspaceRepository {
  const store = new Map<string, Parameters<WorkspaceRepository["create"]>[0]>();

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

test("workspace CRUD supports seeded workspaces and current-state updates", async () => {
  const repository = createMemoryRepository();
  const seeded = seedWorkspaceFromTemplate({
    workspaceId: "workspace-1",
    templateId: "compact-base",
  });

  await createWorkspace(repository, seeded);

  const created = await readWorkspace(repository, "workspace-1");
  assert.equal(created.name, "Compact Base");
  assert.equal(created.cabinetSetup.width.value, 80);

  await updateWorkspace(repository, "workspace-1", {
    name: "Compact Base v2",
    cabinetSetup: {
      ...created.cabinetSetup,
      width: { value: 90, unit: "cm" },
    },
  });

  const updated = await readWorkspace(repository, "workspace-1");
  assert.equal(updated.name, "Compact Base v2");
  assert.equal(updated.cabinetSetup.width.value, 90);

  await deleteWorkspace(repository, "workspace-1");

  await assert.rejects(() => readWorkspace(repository, "workspace-1"), WorkspaceMissingError);
});

test("workspace CRUD reports missing workspaces safely", async () => {
  const repository = createMemoryRepository();

  await assert.rejects(() => readWorkspace(repository, "missing"), WorkspaceMissingError);
  await assert.rejects(
    () => updateWorkspace(repository, "missing", { name: "does not matter" }),
    WorkspaceMissingError,
  );
  await assert.rejects(() => deleteWorkspace(repository, "missing"), WorkspaceMissingError);
});
