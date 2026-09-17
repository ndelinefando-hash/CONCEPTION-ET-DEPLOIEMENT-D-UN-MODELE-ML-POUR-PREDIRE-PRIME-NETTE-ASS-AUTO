import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/devis/$reference")({ component: DevisReference });
function DevisReference(){return <AppShell><PageHeader title="Dossier d'estimation" subtitle="Cette page peut accueillir la restitution d'une estimation enregistrée."/><Card className="surface-card"><CardHeader><CardTitle className="text-[#0B1F3A]">Estimation</CardTitle></CardHeader><CardContent><Link to="/simulateur"><Button className="bg-[#0B1F3A] text-white hover:bg-[#163B68]">Nouvelle estimation</Button></Link></CardContent></Card></AppShell>}
