import { useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { Workspace } from "../../../lib/api/types";
import { useDeleteWorkspace } from "../hooks/useDeleteWorkspace";

export function WorkspaceDeleteCard({
  workspace,
  onDeleted,
}: {
  readonly workspace: Workspace;
  readonly onDeleted: () => void;
}) {
  const deleteWorkspace = useDeleteWorkspace(workspace.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="space-y-4 border-red-200 bg-red-50">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-red-950">Eliminar workspace</h3>
        <p className="text-sm leading-6 text-red-800">
          Esta acción borra el workspace y no se puede deshacer.
        </p>
      </div>

      {deleteWorkspace.isError ? (
        <div className="rounded-lg border border-red-200 bg-white p-3 text-sm text-red-800">
          Error eliminando workspace: {deleteWorkspace.error.message}
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="space-y-3 rounded-lg border border-red-200 bg-white p-4">
          <p className="text-sm leading-6 text-slate-700">
            Confirma que quieres eliminar <strong>{workspace.name}</strong>.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteWorkspace.isPending}
              onClick={async () => {
                await deleteWorkspace.mutateAsync();
                onDeleted();
              }}
            >
              {deleteWorkspace.isPending ? "Eliminando..." : "Sí, eliminar"}
            </Button>

            <Button
              className="bg-slate-100 text-slate-900 hover:bg-slate-200"
              disabled={deleteWorkspace.isPending}
              onClick={() => {
                deleteWorkspace.reset();
                setConfirmDelete(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              deleteWorkspace.reset();
              setConfirmDelete(true);
            }}
          >
            Eliminar workspace
          </Button>
        </div>
      )}
    </Card>
  );
}
