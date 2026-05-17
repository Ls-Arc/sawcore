declare module "bun:sqlite" {
  export interface SQLiteDatabaseOptions {
    readonly create?: boolean;
  }

  export interface SQLiteQueryResult {
    readonly changes: number;
  }

  export interface SQLiteStatement<T = unknown> {
    get(params?: Record<string, unknown>): T | null;
    all(params?: Record<string, unknown>): T[];
    run(params?: Record<string, unknown>): SQLiteQueryResult;
  }

  export class Database {
    constructor(path: string, options?: SQLiteDatabaseOptions);
    run(sql: string): SQLiteQueryResult;
    query<T = unknown>(sql: string): SQLiteStatement<T>;
  }
}
