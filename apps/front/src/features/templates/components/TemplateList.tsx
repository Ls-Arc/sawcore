import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { MaterialCatalogEntry, StarterTemplate } from "../../../lib/api/types";
import { useMaterials } from "../../materials/hooks/useMaterials";
import { useCreateWorkspace } from "../../workspaces/hooks/useCreateWorkspace";
import { useTemplates } from "../hooks/useTemplates";

function TemplateCard({
  template,
  defaultMaterialId,
  materials,
  materialsAreLoading,
  materialsErrorMessage,
}: {
  readonly template: StarterTemplate;
  readonly defaultMaterialId: string;
  readonly materials: readonly MaterialCatalogEntry[];
  readonly materialsAreLoading: boolean;
  readonly materialsErrorMessage?: string;
}) {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [workspaceName, setWorkspaceName] = useState(template.name);
  const [selectedMaterialId, setSelectedMaterialId] = useState(defaultMaterialId);
  const hasTouchedMaterial = useRef(false);

  useEffect(() => {
    if (!hasTouchedMaterial.current && selectedMaterialId === "" && defaultMaterialId !== "") {
      setSelectedMaterialId(defaultMaterialId);
    }
  }, [defaultMaterialId, selectedMaterialId]);

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {template.id}
          </p>
          <h2 className="text-xl font-semibold text-slate-950">{template.name}</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600">{template.description}</p>
      </div>

      <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
        <span>
          Ancho: {template.cabinetSetup.width.value}
          {template.cabinetSetup.width.unit}
        </span>
        <span>
          Alto: {template.cabinetSetup.height.value}
          {template.cabinetSetup.height.unit}
        </span>
        <span>
          Fondo: {template.cabinetSetup.depth.value}
          {template.cabinetSetup.depth.unit}
        </span>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();

          const workspace = await createWorkspace.mutateAsync({
            templateId: template.id,
            workspaceName: workspaceName.trim() || template.name,
            ...(selectedMaterialId ? { selectedMaterialId } : {}),
          });

          navigate(`/workspaces/${workspace.id}`);
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Nombre inicial</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            disabled={createWorkspace.isPending}
            onChange={(event) => setWorkspaceName(event.target.value)}
            value={workspaceName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Material aprobado</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            disabled={createWorkspace.isPending || materialsAreLoading || !!materialsErrorMessage}
            onChange={(event) => {
              hasTouchedMaterial.current = true;
              setSelectedMaterialId(event.target.value);
            }}
            value={selectedMaterialId}
          >
            <option value="">Sin material seleccionado</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </label>

        {materialsAreLoading ? (
          <p className="text-xs leading-5 text-slate-500">Cargando materiales aprobados...</p>
        ) : null}

        {materialsErrorMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            No se pudieron cargar los materiales: {materialsErrorMessage}
          </div>
        ) : null}

        {createWorkspace.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
            No se pudo crear el workspace: {createWorkspace.error.message}
          </div>
        ) : null}

        <Button disabled={createWorkspace.isPending} type="submit">
          {createWorkspace.isPending ? "Creando..." : "Crear workspace"}
        </Button>
      </form>
    </Card>
  );
}

export function TemplateList() {
  const { data, isLoading, isError, error } = useTemplates();
  const materials = useMaterials();

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

  const materialOptions = materials.data ?? [];
  const defaultMaterialId = materialOptions[0]?.id ?? "";
  const materialsErrorMessage = materials.isError ? materials.error.message : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((template) => (
        <TemplateCard
          defaultMaterialId={defaultMaterialId}
          materials={materialOptions}
          materialsAreLoading={materials.isLoading}
          materialsErrorMessage={materialsErrorMessage}
          key={template.id}
          template={template}
        />
      ))}
    </div>
  );
}
