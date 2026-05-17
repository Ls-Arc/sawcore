import { useEffect, useMemo, useState } from "react";

import { Card } from "../../../components/ui/Card";
import type { PreviewModel } from "../../../lib/api/types";

type PartGroup = {
  readonly key: string;
  readonly label: string;
  count: number;
  readonly fill: string;
  readonly stroke: string;
};

function formatMm(value: number) {
  return `${value.toFixed(1)} mm`;
}

function truncateLabel(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getPartLabel(part: PreviewModel["parts"][number]) {
  return truncateLabel(part.name || part.id, 24);
}

function shouldShowPartLabel(part: PreviewModel["parts"][number]) {
  return part.displayWidthMm >= 28 && part.displayHeightMm >= 14;
}

function isReadyPreview(preview: PreviewModel): preview is PreviewModel & { state: "ready" } {
  return preview.state === "ready";
}

function getPartGroupKey(part: PreviewModel["parts"][number]) {
  const source = (part.name || part.id).trim().toLowerCase();
  const tokens = source.split(/[\s/|:_-]+/).filter(Boolean);

  if (tokens.length === 0) {
    return part.id.toLowerCase();
  }

  return tokens.slice(0, Math.min(2, tokens.length)).join(" ");
}

function getPartGroupLabel(part: PreviewModel["parts"][number]) {
  return getPartGroupKey(part)
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function getPartColor(groupKey: string) {
  const palette = [
    { fill: "#dbeafe", stroke: "#2563eb" },
    { fill: "#dcfce7", stroke: "#16a34a" },
    { fill: "#f3e8ff", stroke: "#9333ea" },
    { fill: "#fee2e2", stroke: "#dc2626" },
    { fill: "#fef3c7", stroke: "#d97706" },
    { fill: "#ccfbf1", stroke: "#0f766e" },
    { fill: "#e2e8f0", stroke: "#475569" },
  ];

  return palette[hashString(groupKey) % palette.length];
}

function getPartGroups(parts: readonly PreviewModel["parts"][number][]) {
  return parts.reduce<PartGroup[]>((accumulator, part) => {
    const key = getPartGroupKey(part);
    const color = getPartColor(key);
    const existing = accumulator.find((group) => group.key === key);

    if (existing) {
      existing.count += 1;
      return accumulator;
    }

    accumulator.push({ key, label: getPartGroupLabel(part), count: 1, ...color });
    return accumulator;
  }, []);
}

function getPartDetails(part: PreviewModel["parts"][number]) {
  return [
    { label: "Cantidad", value: formatCount(part.quantity) },
    { label: "Dimensiones", value: `${part.lengthMm} × ${part.widthMm} × ${part.thicknessMm} mm` },
    { label: "Posición", value: `x ${part.xMm}, y ${part.yMm}` },
    { label: "Render box", value: `${part.displayWidthMm} × ${part.displayHeightMm} mm` },
    { label: "Allowance", value: `${part.allowanceMm} mm` },
  ];
}

function WorkspacePreviewLegend({ groups }: { groups: readonly PartGroup[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Leyenda</div>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <div
            key={group.key}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: group.fill, borderColor: group.stroke }}
            />
            <span>{group.label}</span>
            <span className="text-slate-500">({group.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceSelectedPartCard({ part }: { part?: PreviewModel["parts"][number] | null }) {
  return (
    <Card className="space-y-3 border-slate-200 bg-slate-50">
      <div>
        <h4 className="text-sm font-semibold text-slate-950">Detalle de pieza</h4>
        <p className="text-xs leading-5 text-slate-500">Información útil sobre la selección actual.</p>
      </div>

      {part ? (
        <dl className="space-y-2 text-sm text-slate-700">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Nombre</dt>
            <dd className="font-medium text-slate-950">{part.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">ID</dt>
            <dd>{part.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Grupo</dt>
            <dd>{getPartGroupLabel(part)}</dd>
          </div>
          {getPartDetails(part).map((item) => (
            <div key={item.label}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm leading-6 text-slate-600">Selecciona una pieza en el SVG o en la tabla para ver sus detalles.</p>
      )}
    </Card>
  );
}

function WorkspacePreviewSvg({
  preview,
  selectedPartId,
  onSelectPart,
}: {
  preview: PreviewModel & { state: "ready" };
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}) {
  const { canvas, parts } = preview;

  if (canvas.widthMm <= 0 || canvas.heightMm <= 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Vista SVG</span>
        <span>
          {formatMm(canvas.widthMm)} × {formatMm(canvas.heightMm)}
        </span>
      </div>

      <div className="max-h-96 overflow-auto rounded-md bg-white">
        <svg
          aria-label="Vista SVG del layout del workspace"
          className="block h-auto w-full min-w-full"
          preserveAspectRatio="xMinYMin meet"
          role="img"
          viewBox={`0 0 ${canvas.widthMm} ${canvas.heightMm}`}
        >
          <title>Preview del workspace</title>
          <desc>Representación simple de las piezas ubicadas sobre el canvas del workspace.</desc>

          <rect
            fill="#f8fafc"
            height={canvas.heightMm}
            rx={4}
            stroke="#cbd5e1"
            width={canvas.widthMm}
            x={0}
            y={0}
          />

          {parts.map((part) => {
            const isSelected = part.id === selectedPartId;
            const showLabel = shouldShowPartLabel(part);
            const label = getPartLabel(part);
            const quantityLabel = part.quantity > 1 ? `×${part.quantity}` : null;
            const { fill, stroke } = getPartColor(getPartGroupKey(part));

            return (
              <g
                key={part.id}
                aria-label={`${part.name}, ${part.quantity} piezas`}
                aria-pressed={isSelected}
                className="cursor-pointer outline-none"
                role="button"
                tabIndex={0}
                onClick={() => onSelectPart(part.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectPart(part.id);
                  }
                }}
              >
                <title>
                  {part.name} · {part.quantity} piezas · {part.lengthMm} × {part.widthMm} × {part.thicknessMm} mm · frame x {part.xMm}, y {part.yMm}
                </title>
                <rect
                  fill={fill}
                  fillOpacity={isSelected ? 1 : 0.92}
                  height={part.displayHeightMm}
                  rx={2}
                  stroke={isSelected ? "#0f172a" : stroke}
                  strokeWidth={isSelected ? 1.5 : 1}
                  width={part.displayWidthMm}
                  x={part.xMm}
                  y={part.yMm}
                />
                {showLabel ? (
                  <text
                    fill="#334155"
                    fontSize={4.5}
                    fontWeight={600}
                    textAnchor="middle"
                    x={part.xMm + part.displayWidthMm / 2}
                    y={part.yMm + part.displayHeightMm / 2}
                  >
                    <tspan x={part.xMm + part.displayWidthMm / 2} dy={quantityLabel ? -1.6 : 0.8}>
                      {label}
                    </tspan>
                    {quantityLabel ? (
                      <tspan x={part.xMm + part.displayWidthMm / 2} dy={3.2} fontSize={3.8} fontWeight={500}>
                        {quantityLabel}
                      </tspan>
                    ) : null}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function WorkspacePreviewCard({
  preview,
  isLoading,
  isFetching,
  error,
}: {
  preview?: PreviewModel;
  isLoading: boolean;
  isFetching: boolean;
  error?: Error | null;
}) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  useEffect(() => {
    if (!preview || preview.state !== "ready" || preview.parts.length === 0) {
      setSelectedPartId(null);
      return;
    }

    setSelectedPartId((current) => {
      if (current && preview.parts.some((part) => part.id === current)) {
        return current;
      }

      return preview.parts[0]?.id ?? null;
    });
  }, [preview]);

  const selectedPart = preview?.state === "ready" && selectedPartId
    ? preview.parts.find((part) => part.id === selectedPartId) ?? preview.parts[0] ?? null
    : null;

  const partGroups = useMemo(() => {
    if (!preview || preview.state !== "ready") {
      return [] as PartGroup[];
    }

    return getPartGroups(preview.parts);
  }, [preview]);

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
  };

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-950">Preview</h3>
        <p className="text-sm leading-6 text-slate-600">
          Vista simple del estado actual del workspace para validar el resultado del backend.
        </p>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Cargando preview...</p> : null}

      {!isLoading && isFetching && preview ? (
        <p className="text-xs text-slate-500">Actualizando preview...</p>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error cargando preview: {error.message}
        </div>
      ) : null}

      {preview ? (
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <span>Workspace: {preview.workspaceId}</span>
          <span>Estado: {preview.state}</span>
          <span>
            Canvas: {formatMm(preview.canvas.widthMm)} × {formatMm(preview.canvas.heightMm)}
          </span>
          <span>Piezas: {preview.parts.length}</span>
        </div>
      ) : null}

      {!isLoading && !error && preview?.state === "empty" ? (
        <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Preview vacía</p>
          <p>{preview.message ?? "No hay piezas para mostrar todavía."}</p>
        </div>
      ) : null}

      {!isLoading && !error && preview?.state === "ready" ? (
        <div className="space-y-4">
          {preview.message ? (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{preview.message}</p>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div className="space-y-4">
              {isReadyPreview(preview) ? (
                <WorkspacePreviewSvg
                  onSelectPart={handlePartSelect}
                  preview={preview}
                  selectedPartId={selectedPartId}
                />
              ) : null}

              {partGroups.length > 0 ? <WorkspacePreviewLegend groups={partGroups} /> : null}
            </div>

            <WorkspaceSelectedPartCard part={selectedPart} />
          </div>

          {preview.costSummary ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Costo estimado</p>
              <p>
                {preview.costSummary.materialName} · {preview.costSummary.estimatedSheetCount} hojas ·{" "}
                {formatCurrency(preview.costSummary.estimatedCostCents)}
              </p>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Pieza</th>
                  <th className="px-3 py-2 font-medium">Cantidad</th>
                  <th className="px-3 py-2 font-medium">Dimensiones</th>
                  <th className="px-3 py-2 font-medium">Frame</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                {preview.parts.map((part) => {
                  const isSelected = part.id === selectedPartId;

                  return (
                    <tr
                      key={part.id}
                      aria-selected={isSelected}
                      className={[
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-slate-100" : "hover:bg-slate-50",
                      ].join(" ")}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePartSelect(part.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handlePartSelect(part.id);
                        }
                      }}
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-950">{part.name}</div>
                        <div className="text-xs text-slate-500">ID: {part.id}</div>
                      </td>
                      <td className="px-3 py-2">{part.quantity}</td>
                      <td className="px-3 py-2">
                        {part.lengthMm} × {part.widthMm} × {part.thicknessMm} mm
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        x {part.xMm}, y {part.yMm}, w {part.displayWidthMm}, h {part.displayHeightMm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
