import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/lots")({ component: Lots });
function Lots(){return <AppShell><PageHeader title="Lots & portefeuilles" subtitle="Espace préparé pour une future estimation en masse des garanties du portefeuille."/><Card className="surface-card"><CardHeader><CardTitle className="text-[#0B1F3A]">Extension future</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">Le modèle final peut être intégré à un traitement de portefeuille afin de produire une estimation ligne par ligne. Cette fonctionnalité n'est pas utilisée dans la démonstration actuelle.</CardContent></Card></AppShell>}
