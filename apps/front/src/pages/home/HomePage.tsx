import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Bun + Vite + React
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
          Frontend para consumir la API de ModuleWood
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          El primer objetivo NO es hacer una UI bonita. Es validar que el contrato
          entre frontend y API funciona de punta a punta.
        </p>
      </div>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-950">Primer flujo recomendado</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
          <li>Listar templates desde <code>/api/templates</code>.</li>
          <li>Crear un workspace desde un template.</li>
          <li>Navegar al detalle con <code>/workspaces/:id</code>.</li>
          <li>Validar que la API devuelve el workspace recién creado.</li>
        </ol>
        <Link className="text-sm font-medium text-slate-900 underline underline-offset-4" to="/templates">
          Ir a templates
        </Link>
      </Card>
    </section>
  );
}
