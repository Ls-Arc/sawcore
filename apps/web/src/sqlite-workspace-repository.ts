import { Database } from "bun:sqlite";

import type { Workspace } from "@modulewood/domain";

import type { WorkspaceRepository } from "@modulewood/workspace-crud";

export interface SqliteWorkspaceRepositoryOptions {
  readonly databasePath: string;
}

type PersistedWorkspaceRow = {
  readonly id: string;
  readonly payload: string;
  readonly created_at_ms: number;
};

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at_ms INTEGER NOT NULL
  )
`;

const CREATE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS workspaces_created_at_ms_id_index
  ON workspaces(created_at_ms ASC, id ASC)
`;

function cloneWorkspace(workspace: Workspace): Workspace {
  return structuredClone(workspace);
}

function decodeWorkspace(row: PersistedWorkspaceRow): Workspace {
  return JSON.parse(row.payload) as Workspace;
}

function prepareDatabase(databasePath: string): Database {
  const database = new Database(databasePath, { create: true });

  database.run(CREATE_TABLE_SQL);
  database.run(CREATE_INDEX_SQL);

  return database;
}

export function createSqliteWorkspaceRepository(
  options: SqliteWorkspaceRepositoryOptions,
): WorkspaceRepository {
  const database = prepareDatabase(options.databasePath);

  return {
    async create(workspace) {
      const nextWorkspace = cloneWorkspace(workspace);
      const createdAtMs = Date.now();

      database
        .query("INSERT INTO workspaces (id, payload, created_at_ms) VALUES ($id, $payload, $createdAtMs)")
        .run({
          $id: nextWorkspace.id,
          $payload: JSON.stringify(nextWorkspace),
          $createdAtMs: createdAtMs,
        });

      return cloneWorkspace(nextWorkspace);
    },
    async read(workspaceId) {
      const row = database
        .query("SELECT id, payload, created_at_ms FROM workspaces WHERE id = $id")
        .get({ $id: workspaceId }) as PersistedWorkspaceRow | null;

      return row ? cloneWorkspace(decodeWorkspace(row)) : null;
    },
    async update(workspace) {
      const existingRow = database
        .query("SELECT created_at_ms FROM workspaces WHERE id = $id")
        .get({ $id: workspace.id }) as Pick<PersistedWorkspaceRow, "created_at_ms"> | null;

      if (!existingRow) {
        return null;
      }

      const nextWorkspace = cloneWorkspace(workspace);

      database
        .query("UPDATE workspaces SET payload = $payload WHERE id = $id")
        .run({
          $id: nextWorkspace.id,
          $payload: JSON.stringify(nextWorkspace),
        });

      return cloneWorkspace(nextWorkspace);
    },
    async delete(workspaceId) {
      const result = database.query("DELETE FROM workspaces WHERE id = $id").run({ $id: workspaceId });
      return result.changes > 0;
    },
    async list() {
      const rows = database
        .query("SELECT id, payload, created_at_ms FROM workspaces ORDER BY created_at_ms ASC, id ASC")
        .all() as PersistedWorkspaceRow[];

      return rows.map((row) => cloneWorkspace(decodeWorkspace(row)));
    },
  };
}
