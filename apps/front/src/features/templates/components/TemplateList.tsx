import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useCreateWorkspace } from "../../workspaces/hooks/useCreateWorkspace";
import { useTemplates } from "../hooks/useTemplates";

export function TemplateList() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTemplates();
  const createWorkspace = useCreateWorkspace();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando templates...</p>;
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 text-red-800">
        Error cargando templates: {error.message}
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return <Card>No hay templates disponibles.</Card>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((template) => (
        <Card className="flex h-full flex-col gap-4" key={template.id}>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {template.id}
              </p>
              <h2 className="text-xl font-semibold text-slate-950">
                {template.name}
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {template.description}
            </p>
          </div>

          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
            <span>Ancho: {template.cabinetSetup.width.value}{template.cabinetSetup.width.unit}</span>
            <span>Alto: {template.cabinetSetup.height.value}{template.cabinetSetup.height.unit}</span>
            <span>Fondo: {template.cabinetSetup.depth.value}{template.cabinetSetup.depth.unit}</span>
          </div>

          <div className="mt-auto">
            <Button
              disabled={createWorkspace.isPending}
              onClick={async () => {
                const workspace = await createWorkspace.mutateAsync({
                  templateId: template.id,
                  workspaceName: template.name,
                });

                navigate(`/workspaces/${workspace.id}`);
              }}
            >
              {createWorkspace.isPending ? "Creando..." : "Crear workspace"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
