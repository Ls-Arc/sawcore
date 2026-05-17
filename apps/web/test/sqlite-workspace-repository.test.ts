import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { seedWorkspaceFromTemplate } from "@modulewood/template-starters";
import { starterSeededMaterialSelectedJourney } from "@modulewood/validation-fixtures";

import { createSqliteWorkspaceRepository } from "../src/sqlite-workspace-repository.js";

function createTempDatabasePath(testName: string): string {
  const directory = mkdtempSync(join(tmpdir(), `modulewood-${testName}-`));
  return join(directory, "workspace.sqlite");
}

test("sqlite workspace repository round-trips CRUD and lists in deterministic order", async () => {
  const databasePath = createTempDatabasePath("sqlite-repo-order");
  const repository = createSqliteWorkspaceRepository({ databasePath });

  try {
    const first = seedWorkspaceFromTemplate({
      workspaceId: "workspace-a",
      templateId: starterSeededMaterialSelectedJourney.templateId,
    });
    const second = seedWorkspaceFromTemplate({
      workspaceId: "workspace-b",
      templateId: starterSeededMaterialSelectedJourney.templateId,
    });

    await repository.create(first);
    await repository.create(second);

    const listed = await repository.list();

    assert.deepStrictEqual(listed.map((workspace) => workspace.id), ["workspace-a", "workspace-b"]);

    const updated = await repository.update({
      ...second,
      name: "workspace-b-updated",
    });

    assert.equal(updated?.name, "workspace-b-updated");
    assert.deepStrictEqual(await repository.read("workspace-b"), updated);

    assert.equal(await repository.delete("workspace-a"), true);
    assert.equal(await repository.read("workspace-a"), null);
  } finally {
    rmSync(databasePath, { force: true });
    rmSync(dirname(databasePath), { force: true, recursive: true });
  }
});

test("sqlite workspace repository isolates state per database file", async () => {
  const firstDatabasePath = createTempDatabasePath("sqlite-repo-isolation-a");
  const secondDatabasePath = createTempDatabasePath("sqlite-repo-isolation-b");
  const firstRepository = createSqliteWorkspaceRepository({ databasePath: firstDatabasePath });
  const secondRepository = createSqliteWorkspaceRepository({ databasePath: secondDatabasePath });

  try {
    await firstRepository.create(
      seedWorkspaceFromTemplate({
        workspaceId: "workspace-a",
        templateId: starterSeededMaterialSelectedJourney.templateId,
      }),
    );

    assert.deepStrictEqual((await firstRepository.list()).map((workspace) => workspace.id), ["workspace-a"]);
    assert.deepStrictEqual(await secondRepository.list(), []);
  } finally {
    rmSync(firstDatabasePath, { force: true });
    rmSync(secondDatabasePath, { force: true });
    rmSync(dirname(firstDatabasePath), { force: true, recursive: true });
    rmSync(dirname(secondDatabasePath), { force: true, recursive: true });
  }
});
