import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { createWebFlow } from "./flow.js";
import { createWebServer } from "./http.js";
import { createSqliteWorkspaceRepository } from "./sqlite-workspace-repository.js";

export const DEFAULT_SQLITE_DATABASE_PATH = "./.data/modulewood.sqlite";

type SqliteRuntimeEnv = {
  readonly MODULEWOOD_SQLITE_PATH?: string;
};

export function resolveSqliteDatabasePath(
  env: SqliteRuntimeEnv = process.env,
): string {
  return env.MODULEWOOD_SQLITE_PATH ?? DEFAULT_SQLITE_DATABASE_PATH;
}

export function createRuntimeWebServer(
  env: SqliteRuntimeEnv = process.env,
): ReturnType<typeof createWebServer> {
  const databasePath = resolveSqliteDatabasePath(env);

  mkdirSync(dirname(databasePath), { recursive: true });

  const repository = createSqliteWorkspaceRepository({ databasePath });

  return createWebServer(createWebFlow({ repository }));
}

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createRuntimeWebServer();

  server.listen(port, () => {
    console.log(`modulewood web listening on http://127.0.0.1:${port}`);
  });
}
