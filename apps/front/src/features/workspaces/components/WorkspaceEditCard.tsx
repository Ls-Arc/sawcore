import { useEffect, useMemo, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { Measurement, Unit, Workspace } from "../../../lib/api/types";
import { useMaterials } from "../../materials/hooks/useMaterials";
import { useUpdateWorkspace } from "../hooks/useUpdateWorkspace";

const UNIT_OPTIONS: readonly Unit[] = ["mm", "cm", "in"];
const DEFAULT_OPTIONAL_MEASUREMENT_VALUE = 2;

type BackPanelFit = "overlay" | "inset";

type CabinetSetupDraft = {
  readonly width: Measurement;
  readonly height: Measurement;
  readonly depth: Measurement;
  readonly materialThickness: Measurement;
  readonly allowancesCut: Measurement;
  readonly backPanelFit: BackPanelFit;
  readonly backInset: Measurement;
};

function createMeasurementDraft(measurement: Measurement | undefined, fallbackUnit: Unit): Measurement {
  return measurement ?? { value: DEFAULT_OPTIONAL_MEASUREMENT_VALUE, unit: fallbackUnit };
}

function createCabinetSetupDraft(workspace: Workspace["cabinetSetup"]): CabinetSetupDraft {
  const fallbackUnit = workspace.width.unit;

  return {
    width: { ...workspace.width },
    height: { ...workspace.height },
    depth: { ...workspace.depth },
    materialThickness: { ...workspace.materialThickness },
    allowancesCut: createMeasurementDraft(workspace.allowances?.cut, fallbackUnit),
    backPanelFit: workspace.constructionRules?.backPanelFit ?? "overlay",
    backInset: createMeasurementDraft(workspace.constructionRules?.allowances?.backInset, fallbackUnit),
  };
}

function buildCabinetSetupPayload(draft: CabinetSetupDraft): Workspace["cabinetSetup"] {
  return {
    width: { ...draft.width },
    height: { ...draft.height },
    depth: { ...draft.depth },
    materialThickness: { ...draft.materialThickness },
    allowances: {
      cut: { ...draft.allowancesCut },
    },
    constructionRules: {
      backPanelFit: draft.backPanelFit,
      allowances: {
        backInset: { ...draft.backInset },
      },
    },
  };
}

function MeasurementField({
  label,
  measurement,
  disabled,
  helpText,
  onUnitChange,
  onValueChange,
}: {
  readonly label: string;
  readonly measurement: Measurement;
  readonly disabled: boolean;
  readonly helpText?: string;
  readonly onValueChange: (value: number) => void;
  readonly onUnitChange: (unit: Unit) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          disabled={disabled}
          inputMode="decimal"
          min="0"
          onChange={(event) => onValueChange(event.target.value === "" ? 0 : Number(event.target.value))}
          step="0.1"
          type="number"
          value={measurement.value}
        />
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          disabled={disabled}
          onChange={(event) => onUnitChange(event.target.value as Unit)}
          value={measurement.unit}
        >
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      {helpText ? <p className="text-xs leading-5 text-slate-500">{helpText}</p> : null}
    </label>
  );
}

export function WorkspaceEditCard({ workspace }: { workspace: Workspace }) {
  const materials = useMaterials();
  const updateWorkspace = useUpdateWorkspace(workspace.id);

  const [name, setName] = useState(workspace.name);
  const [selectedMaterialId, setSelectedMaterialId] = useState(workspace.selectedMaterialId ?? "");
  const [cabinetSetup, setCabinetSetup] = useState(() => createCabinetSetupDraft(workspace.cabinetSetup));

  useEffect(() => {
    setName(workspace.name);
    setSelectedMaterialId(workspace.selectedMaterialId ?? "");
    setCabinetSetup(createCabinetSetupDraft(workspace.cabinetSetup));
  }, [
    workspace.cabinetSetup.allowances?.cut?.unit,
    workspace.cabinetSetup.allowances?.cut?.value,
    workspace.cabinetSetup.constructionRules?.allowances?.backInset?.unit,
    workspace.cabinetSetup.constructionRules?.allowances?.backInset?.value,
    workspace.cabinetSetup.constructionRules?.backPanelFit,
    workspace.cabinetSetup.depth.unit,
    workspace.cabinetSetup.depth.value,
    workspace.cabinetSetup.height.unit,
    workspace.cabinetSetup.height.value,
    workspace.cabinetSetup.materialThickness.unit,
    workspace.cabinetSetup.materialThickness.value,
    workspace.cabinetSetup.width.unit,
    workspace.cabinetSetup.width.value,
    workspace.id,
    workspace.name,
    workspace.selectedMaterialId,
  ]);

  const materialOptions = materials.data ?? [];
  const currentMaterialKnown = useMemo(
    () =>
      selectedMaterialId === "" ||
      materialOptions.some((material) => material.id === selectedMaterialId),
    [materialOptions, selectedMaterialId],
  );

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-950">Editar workspace</h3>
        <p className="text-sm leading-6 text-slate-600">
          Ajusta el nombre, el material aprobado y el cabinet setup base para regenerar el preview.
        </p>
        <p className="text-xs leading-5 text-slate-500">
          Nota: la API actual permite cambiar el material, pero no quitarlo una vez asignado.
        </p>
      </div>

      {materials.isLoading ? (
        <p className="text-sm text-slate-500">Cargando materiales aprobados...</p>
      ) : null}

      {materials.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error cargando materiales: {materials.error.message}
        </div>
      ) : null}

      {updateWorkspace.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error guardando workspace: {updateWorkspace.error.message}
        </div>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();

          await updateWorkspace.mutateAsync({
            name,
            ...(selectedMaterialId === ""
              ? { selectedMaterialId: undefined }
              : { selectedMaterialId }),
            cabinetSetup: buildCabinetSetupPayload(cabinetSetup),
          });
        }}
      >
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              disabled={updateWorkspace.isPending}
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Material</span>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              disabled={updateWorkspace.isPending || materials.isLoading || materials.isError}
              onChange={(event) => setSelectedMaterialId(event.target.value)}
              value={selectedMaterialId}
            >
              <option value="">Selecciona un material</option>
              {!currentMaterialKnown && selectedMaterialId !== "" ? (
                <option value={selectedMaterialId}>Material actual no encontrado</option>
              ) : null}
              {materialOptions.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-slate-950">Cabinet setup</h4>
            <p className="text-sm leading-6 text-slate-600">
              Define las dimensiones base y las reglas que alimentan la generación del preview.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <MeasurementField
                disabled={updateWorkspace.isPending}
                label="Ancho"
                measurement={cabinetSetup.width}
                onUnitChange={(unit) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    width: { ...current.width, unit },
                  }))
                }
                onValueChange={(value) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    width: { ...current.width, value },
                  }))
                }
              />

              <MeasurementField
                disabled={updateWorkspace.isPending}
                label="Alto"
                measurement={cabinetSetup.height}
                onUnitChange={(unit) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    height: { ...current.height, unit },
                  }))
                }
                onValueChange={(value) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    height: { ...current.height, value },
                  }))
                }
              />

              <MeasurementField
                disabled={updateWorkspace.isPending}
                label="Fondo"
                measurement={cabinetSetup.depth}
                onUnitChange={(unit) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    depth: { ...current.depth, unit },
                  }))
                }
                onValueChange={(value) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    depth: { ...current.depth, value },
                  }))
                }
              />

              <MeasurementField
                disabled={updateWorkspace.isPending}
                label="Espesor del material"
                measurement={cabinetSetup.materialThickness}
                onUnitChange={(unit) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    materialThickness: { ...current.materialThickness, unit },
                  }))
                }
                onValueChange={(value) =>
                  setCabinetSetup((current) => ({
                    ...current,
                    materialThickness: { ...current.materialThickness, value },
                  }))
                }
              />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-4 space-y-1">
                <h5 className="text-sm font-semibold text-slate-900">Reglas de construcción</h5>
                <p className="text-xs leading-5 text-slate-500">
                  Mantengo estas reglas visibles para que el preview responda de forma predecible.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MeasurementField
                  disabled={updateWorkspace.isPending}
                  helpText="Allowance aplicado al corte base del cabinet."
                  label="Allowance de corte"
                  measurement={cabinetSetup.allowancesCut}
                  onUnitChange={(unit) =>
                    setCabinetSetup((current) => ({
                      ...current,
                      allowancesCut: { ...current.allowancesCut, unit },
                    }))
                  }
                  onValueChange={(value) =>
                    setCabinetSetup((current) => ({
                      ...current,
                      allowancesCut: { ...current.allowancesCut, value },
                    }))
                  }
                />

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Back panel fit</span>
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    disabled={updateWorkspace.isPending}
                    onChange={(event) =>
                      setCabinetSetup((current) => ({
                        ...current,
                        backPanelFit: event.target.value as BackPanelFit,
                      }))
                    }
                    value={cabinetSetup.backPanelFit}
                  >
                    <option value="overlay">overlay</option>
                    <option value="inset">inset</option>
                  </select>
                  <p className="text-xs leading-5 text-slate-500">
                    Controla cómo se asienta el panel trasero en el armado.
                  </p>
                </label>

                <MeasurementField
                  disabled={updateWorkspace.isPending}
                  helpText="Allowance opcional para desplazar el panel trasero hacia adentro."
                  label="Back inset"
                  measurement={cabinetSetup.backInset}
                  onUnitChange={(unit) =>
                    setCabinetSetup((current) => ({
                      ...current,
                      backInset: { ...current.backInset, unit },
                    }))
                  }
                  onValueChange={(value) =>
                    setCabinetSetup((current) => ({
                      ...current,
                      backInset: { ...current.backInset, value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button
            disabled={updateWorkspace.isPending || materials.isLoading || materials.isError}
            type="submit"
          >
            {updateWorkspace.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>

          {updateWorkspace.isSuccess ? (
            <span className="text-sm text-emerald-700">Guardado.</span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
