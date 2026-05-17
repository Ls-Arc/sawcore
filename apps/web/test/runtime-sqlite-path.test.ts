import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { createRuntimeWebServer, DEFAULT_SQLITE_DATABASE_PATH, resolveSqliteDatabasePath } from "../src/server.js";

async function getFreePort(): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (typeof address === "object" && address && "port" in address) {
        const port = address.port;
        server.close(() => resolve(port));
        return;
      }

      server.close(() => reject(new Error("Unable to allocate a free port")));
    });
  });
}

test("runtime sqlite path defaults to the local persistent database file", () => {
  assert.equal(DEFAULT_SQLITE_DATABASE_PATH, "./.data/modulewood.sqlite");
  assert.equal(resolveSqliteDatabasePath({}), "./.data/modulewood.sqlite");
});

test("runtime sqlite path honors MODULEWOOD_SQLITE_PATH when provided", () => {
  assert.equal(
    resolveSqliteDatabasePath({ MODULEWOOD_SQLITE_PATH: "/tmp/custom/modulewood.sqlite" }),
    "/tmp/custom/modulewood.sqlite",
  );
});

test("runtime web server starts even when the persistent database directory is missing", async () => {
  const directory = mkdtempSync(join(tmpdir(), "modulewood-runtime-sqlite-"));
  const databasePath = join(directory, ".data", "modulewood.sqlite");
  const server = createRuntimeWebServer({ MODULEWOOD_SQLITE_PATH: databasePath });
  const port = await getFreePort();

  await new Promise<void>((resolve) => server.listen(port, resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(response.status, 200);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(dirname(databasePath), { recursive: true, force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});
