export function workspaceQueryKey(id: string) {
  return ["workspace", id] as const;
}
