import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, BrainCircuit, Database, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FINAL_METRICS } from "@/lib/actuarial";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Zenithe Prime AI — Estimation de prime nette" }] }),
  component: Dashboard,
});

function Dashboard() {
  return <AppShell>
    <PageHeader title="Zenithe Prime AI" subtitle="Application de démonstration du modèle final de Machine Learning développé pour l'estimation de la prime nette en assurance automobile au Cameroun." action={<Badge className="bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]">Projet final</Badge>} />
    <div className="hero-navy rounded-2xl p-7 shadow-xl lg:p-10"><div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Estimation de la prime nette</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">Une estimation basée sur les caractéristiques du risque et l'expérience passée du portefeuille.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">Le modèle final est un Random Forest entraîné avec imputation simple, Target Encoding et transformation logarithmique de la cible. L'historique des sinistres passés est pris en compte via le coût total des sinistres.</p><div className="mt-6"><Link to="/simulateur"><button className="inline-flex h-11 items-center rounded-lg bg-white px-5 text-sm font-bold text-[#0B1F3A]">Lancer une estimation <ArrowRight className="ml-2 h-4 w-4"/></button></Link></div></div></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["Base finale", "5 065", "garanties"],
        ["Contrats", "643", "contrats"],
        ["RMSE Test", `${Math.round(FINAL_METRICS.rmse).toLocaleString("fr-FR")}`, "FCFA"],
        ["R² Test", FINAL_METRICS.r2.toFixed(4), "coefficient"],
      ].map(([label,value,unit])=><Card key={label} className="surface-card"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-2xl font-extrabold text-[#0B1F3A]">{value}</p><p className="text-xs text-slate-500">{unit}</p></CardContent></Card>)}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      {[
        [Database,"Données historiques","Production, garanties, sinistres et SAP ont été rapprochés pour construire la base d'étude."],
        [BrainCircuit,"Modèle final","Random Forest avec imputation simple, Target Encoding et log(1 + y)."],
        [BarChart3,"Performance","RMSE test 186 041 FCFA, MAE 102 012 FCFA et R² 0,5066."],
      ].map(([Icon,title,text])=><Card key={title as string} className="surface-card"><CardHeader><Icon className="h-6 w-6 text-[#0B1F3A]"/><CardTitle className="text-[#0B1F3A]">{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">{text as string}</CardContent></Card>)}
    </div>
    <Card className="mt-6 border-blue-100 bg-blue-50/60"><CardContent className="flex gap-4 p-5"><ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#0B1F3A]"/><div><p className="font-bold text-[#0B1F3A]">Positionnement de l'application</p><p className="mt-1 text-sm leading-6 text-slate-600">L'application fournit une estimation quantitative de la prime nette. Elle est conçue comme un outil d'aide à la décision et non comme un remplacement automatique de l'expertise du tarificateur.</p></div></CardContent></Card>
  </AppShell>;
}
