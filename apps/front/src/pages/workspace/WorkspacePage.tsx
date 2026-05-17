import { useParams } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { WorkspaceHeader } from "../../features/workspaces/components/WorkspaceHeader";
import { useWorkspace } from "../../features/workspaces/hooks/useWorkspace";

export function WorkspacePage() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, error } = useWorkspace(id);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando workspace...</p>;
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 text-red-800">
        Error cargando workspace: {error.message}
      </Card>
    );
  }

  if (!data) {
    return <Card>No se encontró el workspace solicitado.</Card>;
  }

  return (
    <section className="space-y-6">
      <WorkspaceHeader workspace={data} />

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-950">Payload actual</h3>
        <p className="text-sm leading-6 text-slate-600">
          Mantengo esta vista intencionalmente simple para que verifiques rápido la forma real del objeto devuelto por la API.
        </p>
        <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Card>
    </section>
  );
}
