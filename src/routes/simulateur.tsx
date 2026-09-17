
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, CheckCircle2, History, Loader2, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, GARANTIES, SEGMENTS, TYPES_INTER, VILLES, MARQUES, fcfa, predirePrime, type PrimeInput, type PredictionResult } from "@/lib/actuarial";

export const Route = createFileRoute("/simulateur")({
  head: () => ({ meta: [{ title: "Estimation de la prime nette — Zenithe Prime AI" }] }),
  component: Simulateur,
});

const initial: PrimeInput = {
  age_vehicule_annees: 3,
  duree_garantie_jours: 365,
  places: 5,
  puissance: 9,
  valeur_neuve: 26_000_000,
  valeur_venale: 23_000_000,
  cout_total_sinistres: 0,
  categorie_mère: "Tourisme (VP)",
  garantie: "Dommages",
  segment: "GENERALISTE",
  typeinter: "Bureau Direct",
  ville: "YAOUNDE",
  marque: "TOYOTA",
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div className="space-y-2"><Label className="text-slate-700">{label}</Label>{children}{hint && <p className="text-[11px] text-slate-500">{hint}</p>}</div>;
}

function Simulateur() {
  const [form, setForm] = useState<PrimeInput>(initial);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof PrimeInput>(key: K, value: PrimeInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const estimate = async () => {
    setLoading(true); setError(""); setResult(null);
    try { setResult(await predirePrime(form)); } catch (e) { setError(e instanceof Error ? e.message : "Erreur lors de l'estimation."); }
    finally { setLoading(false); }
  };

  return <AppShell>
    <PageHeader title="Estimation de la prime nette automobile" subtitle="Saisissez les caractéristiques de la garantie et l'expérience passée en sinistres. Le modèle final Random Forest estime la prime nette associée à la garantie." action={<Badge className="bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]">Random Forest final</Badge>} />
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-6">
        <Card className="surface-card border-slate-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-[#0B1F3A]"><Calculator className="h-5 w-5"/>Caractéristiques du risque</CardTitle><CardDescription>Variables utilisées par le modèle final.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="Âge du véhicule (années)"><Input type="number" min="0" step="0.1" value={form.age_vehicule_annees} onChange={e=>set("age_vehicule_annees", Number(e.target.value))}/></Field>
            <Field label="Durée de garantie (jours)"><Input type="number" min="1" value={form.duree_garantie_jours} onChange={e=>set("duree_garantie_jours", Number(e.target.value))}/></Field>
            <Field label="Nombre de places"><Input type="number" min="0" value={form.places} onChange={e=>set("places", Number(e.target.value))}/></Field>
            <Field label="Puissance"><Input type="number" min="0" value={form.puissance} onChange={e=>set("puissance", Number(e.target.value))}/></Field>
            <Field label="Valeur neuve (FCFA)"><Input type="number" min="0" step="100000" value={form.valeur_neuve} onChange={e=>set("valeur_neuve", Number(e.target.value))}/></Field>
            <Field label="Valeur vénale (FCFA)"><Input type="number" min="0" step="100000" value={form.valeur_venale} onChange={e=>set("valeur_venale", Number(e.target.value))}/></Field>
            <Field label="Coût total des sinistres passés (FCFA)" hint="Sinistres déjà survenus avant la nouvelle estimation."><Input type="number" min="0" step="10000" value={form.cout_total_sinistres} onChange={e=>set("cout_total_sinistres", Number(e.target.value))}/></Field>
            <Field label="Catégorie mère"><Select value={form.categorie_mère} onValueChange={v=>set("categorie_mère",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{CATEGORIES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Garantie"><Select value={form.garantie} onValueChange={v=>set("garantie",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{GARANTIES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Segment"><Select value={form.segment} onValueChange={v=>set("segment",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{SEGMENTS.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Type d'intervention"><Select value={form.typeinter} onValueChange={v=>set("typeinter",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{TYPES_INTER.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Ville"><Select value={form.ville} onValueChange={v=>set("ville",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{VILLES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Marque"><Select value={form.marque} onValueChange={v=>set("marque",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{MARQUES.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field>
          </CardContent>
        </Card>
        <Button onClick={estimate} disabled={loading} className="h-12 w-full bg-[#0B1F3A] text-white hover:bg-[#163B68]">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Calcul en cours…</> : <><Calculator className="mr-2 h-4 w-4"/>Estimer la prime nette</>}</Button>
        {error && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 text-sm text-red-700">{error}</CardContent></Card>}
      </div>
      <div className="space-y-6">
        <Card className="hero-navy overflow-hidden border-0"><CardContent className="p-7"><div className="flex items-center gap-2 text-blue-100"><ShieldCheck className="h-5 w-5"/><span className="text-sm font-semibold">Estimation basée sur le modèle final</span></div><p className="mt-6 text-sm text-blue-100">Prime nette estimée</p><p className="mt-1 text-4xl font-extrabold tracking-tight">{result ? fcfa(result.prime_nette_fcfa) : "—"}</p>{result && <div className="mt-5 flex items-start gap-3 rounded-xl bg-white/10 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0"/><p className="text-sm leading-6 text-blue-50">{result.message}</p></div>}</CardContent></Card>
        <Card className="surface-card"><CardHeader><CardTitle className="flex items-center gap-2 text-[#0B1F3A]"><History className="h-5 w-5"/>Historique du risque</CardTitle><CardDescription>Le coût des sinistres passés est fourni au modèle comme information historique.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span className="text-slate-600">Sinistres passés</span><strong>{fcfa(form.cout_total_sinistres)}</strong></div><p className="text-xs leading-5 text-slate-500">Cette information concerne les sinistres déjà survenus avant la période de nouvelle tarification.</p></CardContent></Card>
        <Card className="surface-card"><CardHeader><CardTitle className="text-[#0B1F3A]">Ce que fait le modèle</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-slate-600"><p>Le modèle apprend les relations observées dans le portefeuille historique.</p><p>Il combine les caractéristiques du véhicule, de la garantie, du contrat et l'expérience passée des sinistres.</p><p>Le résultat est une estimation de la <strong className="text-[#0B1F3A]">prime nette</strong>, destinée à servir de référence au tarificateur.</p></CardContent></Card>
      </div>
    </div>
  </AppShell>;
}
