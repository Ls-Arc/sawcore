import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { Workspace } from "../../../lib/api/types";
import { workspaceExportBaseName } from "../api/exportWorkspace";
import { useWorkspaceExport } from "../hooks/useWorkspaceExport";

export function WorkspaceExportCard({ workspace }: { workspace: Workspace }) {
  const workspaceExport = useWorkspaceExport(workspace.id);
  const pendingFormat = workspaceExport.variables?.format;
  const baseName = workspaceExportBaseName(workspace.name, workspace.id);

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-950">Exportar</h3>
        <p className="text-sm leading-6 text-slate-600">
          Descarga el workspace actual como CSV para revisión de datos o PDF para compartir.
        </p>
      </div>

      {workspaceExport.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error exportando workspace: {workspaceExport.error.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="bg-slate-100 text-slate-900 hover:bg-slate-200"
          disabled={workspaceExport.isPending}
          onClick={() =>
            workspaceExport.mutate({
              format: "csv",
              workspaceName: workspace.name,
            })
          }
        >
          {workspaceExport.isPending && pendingFormat === "csv" ? "Exportando CSV..." : "Exportar CSV"}
        </Button>

        <Button
          className="bg-slate-100 text-slate-900 hover:bg-slate-200"
          disabled={workspaceExport.isPending}
          onClick={() =>
            workspaceExport.mutate({
              format: "pdf",
              workspaceName: workspace.name,
            })
          }
        >
          {workspaceExport.isPending && pendingFormat === "pdf" ? "Exportando PDF..." : "Exportar PDF"}
        </Button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Archivo sugerido: {baseName}.csv / {baseName}.pdf
      </p>
    </Card>
  );
}
