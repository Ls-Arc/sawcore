import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_CONSTRUCTION_RULES } from "@modulewood/domain";
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
    templateId: "wall-cabinet",
  });

  await createWorkspace(repository, seeded);

  const created = await readWorkspace(repository, "workspace-1");
  assert.equal(created.name, "Wall Cabinet");
  assert.equal(created.selectedMaterialId, "birch-plywood-18mm");
  assert.equal(created.cabinetSetup.width.value, 80);
  assert.equal(created.cabinetSetup.height.value, 72);
  assert.equal(created.cabinetSetup.depth.value, 35);
  assert.deepStrictEqual(created.cabinetSetup.constructionRules, DEFAULT_CONSTRUCTION_RULES);

  await updateWorkspace(repository, "workspace-1", {
    name: "Wall Cabinet v2",
    selectedMaterialId: "white-melamine-18mm",
    cabinetSetup: {
      ...created.cabinetSetup,
      width: { value: 90, unit: "cm" },
      constructionRules: {
        backPanelFit: "inset",
        allowances: { backInset: { value: 4, unit: "mm" } },
      },
    },
  });

  const updated = await readWorkspace(repository, "workspace-1");
  assert.equal(updated.name, "Wall Cabinet v2");
  assert.equal(updated.selectedMaterialId, "white-melamine-18mm");
  assert.equal(updated.cabinetSetup.width.value, 90);
  assert.deepStrictEqual(updated.cabinetSetup.constructionRules, {
    backPanelFit: "inset",
    allowances: { backInset: { value: 4, unit: "mm" } },
  });

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
