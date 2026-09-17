import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/conformite")({ component: Conformite });
function Conformite(){return <AppShell><PageHeader title="Cadre d'utilisation" subtitle="Positionnement prudent du modèle dans le processus de tarification."/><Card className="surface-card"><CardHeader><ShieldCheck className="h-6 w-6 text-[#0B1F3A]"/><CardTitle className="text-[#0B1F3A]">Aide à la décision</CardTitle></CardHeader><CardContent className="text-sm leading-7 text-slate-600">L'estimation produite par le modèle constitue une information quantitative complémentaire. Elle ne remplace pas la validation du tarificateur et doit être utilisée dans le respect des procédures internes et du cadre réglementaire applicable.</CardContent></Card></AppShell>}
