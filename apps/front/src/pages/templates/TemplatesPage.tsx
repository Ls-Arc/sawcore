import { TemplateList } from "../../features/templates/components/TemplateList";

export function TemplatesPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Templates
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Arranca por un flujo vertical real
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Estos templates vienen de la API. Desde aquí puedes crear un workspace y validar el contrato completo del frontend.
        </p>
      </div>

      <TemplateList />
    </section>
  );
}
