export class WorkspaceMissingError extends Error {
  constructor(public readonly workspaceId: string) {
    super(`Workspace not found: ${workspaceId}`);
    this.name = "WorkspaceMissingError";
  }
}
