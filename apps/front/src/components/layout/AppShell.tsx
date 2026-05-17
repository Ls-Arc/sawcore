import { NavLink, Outlet } from "react-router-dom";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
  ].join(" ");

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              ModuleWood
            </p>
            <h1 className="text-lg font-semibold text-slate-950">Front workspace</h1>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink className={navLinkClassName} to="/" end>
              Inicio
            </NavLink>
            <NavLink className={navLinkClassName} to="/templates">
              Templates
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-col px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
