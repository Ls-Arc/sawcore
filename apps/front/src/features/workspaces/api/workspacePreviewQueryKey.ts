export function workspacePreviewQueryKey(id: string) {
  return ["workspace-preview", id] as const;
}
