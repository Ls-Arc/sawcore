import { API_URL } from "../../../lib/api/config";

type DeleteWorkspaceResponse = {
  readonly ok?: boolean;
  readonly error?: string;
};

async function readResponsePayload(response: Response): Promise<DeleteWorkspaceResponse | null> {
  try {
    return (await response.json()) as DeleteWorkspaceResponse;
  } catch {
    return null;
  }
}

export async function deleteWorkspace(id: string) {
  const response = await fetch(`${API_URL}/api/workspaces/${id}`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
    },
  });

  const payload = await readResponsePayload(response);

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error ?? `No se pudo eliminar el workspace ${id}.`);
  }

  return { ok: true as const };
}
