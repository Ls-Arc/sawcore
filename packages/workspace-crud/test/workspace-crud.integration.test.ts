import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_CONSTRUCTION_RULES } from "@modulewood/domain";
import { seedWorkspaceFromTemplate } from "@modulewood/template-starters";
import { starterSeededMaterialSelectedJourney } from "@modulewood/validation-fixtures";

import {
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
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
    async list() {
      return [...store.values()].map((workspace) => structuredClone(workspace));
    },
  };
}

test("workspace CRUD supports seeded workspaces and current-state updates", async () => {
  const repository = createMemoryRepository();
  const seeded = seedWorkspaceFromTemplate({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    templateId: starterSeededMaterialSelectedJourney.templateId,
  });

  await createWorkspace(repository, seeded);

  const created = await readWorkspace(
    repository,
    starterSeededMaterialSelectedJourney.workspaceId,
  );
  assert.deepStrictEqual(
    created,
    starterSeededMaterialSelectedJourney.expectedCreatedWorkspace,
  );
  assert.deepStrictEqual(
    created.cabinetSetup.constructionRules,
    DEFAULT_CONSTRUCTION_RULES,
  );

  await updateWorkspace(
    repository,
    starterSeededMaterialSelectedJourney.workspaceId,
    starterSeededMaterialSelectedJourney.updateWorkspaceInput,
  );

  const updated = await readWorkspace(
    repository,
    starterSeededMaterialSelectedJourney.workspaceId,
  );
  assert.deepStrictEqual(
    updated,
    starterSeededMaterialSelectedJourney.expectedUpdatedWorkspace,
  );

  await deleteWorkspace(
    repository,
    starterSeededMaterialSelectedJourney.workspaceId,
  );

  await assert.rejects(
    () =>
      readWorkspace(
        repository,
        starterSeededMaterialSelectedJourney.workspaceId,
      ),
    WorkspaceMissingError,
  );
});

test("workspace CRUD reports missing workspaces safely", async () => {
  const repository = createMemoryRepository();

  await assert.rejects(
    () => readWorkspace(repository, "missing"),
    WorkspaceMissingError,
  );
  await assert.rejects(
    () => updateWorkspace(repository, "missing", { name: "does not matter" }),
    WorkspaceMissingError,
  );
  await assert.rejects(
    () => deleteWorkspace(repository, "missing"),
    WorkspaceMissingError,
  );
});

test("workspace list returns cloned workspaces without exposing repository state", async () => {
  const repository = createMemoryRepository();
  const seeded = seedWorkspaceFromTemplate({
    workspaceId: starterSeededMaterialSelectedJourney.workspaceId,
    templateId: starterSeededMaterialSelectedJourney.templateId,
  });

  await createWorkspace(repository, seeded);

  const listed = await listWorkspaces(repository);

  assert.deepStrictEqual(listed, [starterSeededMaterialSelectedJourney.expectedCreatedWorkspace]);

  listed[0]!.name = "mutated";
  listed[0]!.cabinetSetup.width.value = 999;

  const relisted = await listWorkspaces(repository);

  assert.deepStrictEqual(relisted, [starterSeededMaterialSelectedJourney.expectedCreatedWorkspace]);
});

test("workspace list returns an empty collection when the repository has no workspaces", async () => {
  const repository = createMemoryRepository();

  await assert.deepStrictEqual(await listWorkspaces(repository), []);
});
