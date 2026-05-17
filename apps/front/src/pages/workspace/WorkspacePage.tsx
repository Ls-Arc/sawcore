import { useNavigate, useParams } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { WorkspacePreviewCard } from "../../features/workspaces/components/WorkspacePreviewCard";
import { WorkspaceEditCard } from "../../features/workspaces/components/WorkspaceEditCard";
import { WorkspaceHeader } from "../../features/workspaces/components/WorkspaceHeader";
import { WorkspaceExportCard } from "../../features/workspaces/components/WorkspaceExportCard";
import { WorkspaceDeleteCard } from "../../features/workspaces/components/WorkspaceDeleteCard";
import { useWorkspace } from "../../features/workspaces/hooks/useWorkspace";
import { useWorkspacePreview } from "../../features/workspaces/hooks/useWorkspacePreview";

export function WorkspacePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useWorkspace(id);
  const preview = useWorkspacePreview(id);

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
      <WorkspaceExportCard workspace={data} />
      <WorkspaceEditCard workspace={data} />
      <WorkspacePreviewCard
        error={preview.error}
        isFetching={preview.isFetching}
        isLoading={preview.isLoading}
        preview={preview.data}
      />

      <WorkspaceDeleteCard
        onDeleted={() => {
          navigate("/templates", { replace: true });
        }}
        workspace={data}
      />

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
