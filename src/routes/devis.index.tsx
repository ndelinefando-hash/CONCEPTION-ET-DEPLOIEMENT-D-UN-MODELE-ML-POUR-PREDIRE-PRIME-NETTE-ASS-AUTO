import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSignature, History, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/devis/")({
  head: () => ({ meta: [{ title: "Dossier assuré — Zenithe Prime AI" }] }),
  component: DevisPage,
});

function DevisPage() {
  return <AppShell>
    <PageHeader title="Dossier assuré" subtitle="Préparez les informations du dossier avant de lancer l'estimation de la prime nette." />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="surface-card lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-[#0B1F3A]"><FileSignature className="h-5 w-5"/>Principe de l'application</CardTitle><CardDescription>Une estimation fondée sur les données du portefeuille historique.</CardDescription></CardHeader><CardContent className="space-y-4 text-sm leading-7 text-slate-600"><p>Le dossier rassemble les caractéristiques du véhicule, de la garantie et du contrat, ainsi que le coût des sinistres déjà survenus avant la nouvelle tarification.</p><p>Ces informations sont transmises au <strong className="text-[#0B1F3A]">Random Forest final</strong> pour obtenir une estimation de la prime nette.</p><p>L'estimation constitue une référence quantitative pour le tarificateur. Elle ne remplace pas la validation métier.</p><Link to="/simulateur"><Button className="bg-[#0B1F3A] text-white hover:bg-[#163B68]">Ouvrir l'estimation</Button></Link></CardContent></Card>
      <div className="space-y-6"><Card className="hero-navy border-0"><CardContent className="p-6"><ShieldCheck className="h-7 w-7"/><p className="mt-4 text-lg font-bold">Tarification orientée données</p><p className="mt-2 text-sm leading-6 text-blue-100">Le modèle utilise l'expérience historique du portefeuille pour estimer la prime nette.</p></CardContent></Card><Card className="surface-card"><CardHeader><CardTitle className="flex items-center gap-2 text-[#0B1F3A]"><History className="h-5 w-5"/>Historique</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">Les sinistres passés sont intégrés comme information historique du risque.</CardContent></Card></div>
    </div>
  </AppShell>;
}
