import { Card } from "../../../components/ui/Card";
import type { Workspace } from "../../../lib/api/types";

export function WorkspaceHeader({ workspace }: { workspace: Workspace }) {
  return (
    <Card className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">{workspace.name}</h2>
      </div>

      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <span>ID: {workspace.id}</span>
        <span>Material: {workspace.selectedMaterialId ?? "sin definir"}</span>
        <span>
          Ancho: {workspace.cabinetSetup.width.value}
          {workspace.cabinetSetup.width.unit}
        </span>
        <span>
          Alto: {workspace.cabinetSetup.height.value}
          {workspace.cabinetSetup.height.unit}
        </span>
      </div>
    </Card>
  );
}
