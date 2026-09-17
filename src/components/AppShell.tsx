import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, FileSignature, Search, ShieldCheck, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Accueil", icon: LayoutDashboard },
  { to: "/simulateur", label: "Estimation", icon: Calculator },
  { to: "/devis", label: "Dossier assuré", icon: FileSignature },
  { to: "/explicabilite", label: "Modèle & résultats", icon: Search },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-[#0B1F3A] text-white shadow-lg">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B1F3A]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-tight">ZENITHE PRIME AI</span>
              <span className="block text-[11px] text-blue-100">Estimation de la prime nette automobile</span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "bg-white text-[#0B1F3A]" }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
          </nav>
          <button onClick={() => setOpen(!open)} className="ml-auto rounded-lg p-2 lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button>
        </div>
        {open && <nav className="grid gap-1 border-t border-white/10 px-4 py-3 lg:hidden">{NAV.map(({to,label}) => <Link key={to} to={to} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-100">{label}</Link>)}</nav>}
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">{children}</main>
      <footer className="border-t border-border bg-white py-6">
        <p className="mx-auto max-w-[1400px] px-4 text-xs text-slate-500 lg:px-8">Zenithe Prime AI — Modèle Random Forest · Imputation simple · Target Encoding · Transformation log(1 + y) · Cible : prime nette.</p>
      </footer>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4")}><div><h1 className="text-2xl font-extrabold tracking-tight text-[#0B1F3A] lg:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p></div>{action}</div>;
}
