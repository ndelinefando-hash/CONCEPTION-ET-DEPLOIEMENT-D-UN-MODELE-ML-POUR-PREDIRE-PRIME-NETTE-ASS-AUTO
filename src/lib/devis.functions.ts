import { createServerFn } from "@tanstack/react-start";

export interface DevisPayload {
  reference: string;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  immatriculation: string;
  marque: string;
  modele_vehicule: string;
  categorie: string;
  puissance: number;
  age_vehicule: number;
  places: number;
  valeur_venale: number;
  usage: string;
  zone: string;
  intermediaire: string;
  renouvellement: boolean;
  effet: string;
  echeance: string;
  exposition: number;
  garanties: string[];
  prime_pure_annuelle: number;
  prime_pure_prorata: number;
  prime_ttc: number;
}

export const creerDevis = createServerFn({ method: "POST" })
  .inputValidator((data: DevisPayload) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("devis")
      .insert(data)
      .select("reference, token")
      .single();
    if (error) throw new Error(error.message);
    return row as { reference: string; token: string };
  });

export const consulterDevis = createServerFn({ method: "GET" })
  .inputValidator((data: { reference: string; token: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("devis")
      .select("*")
      .eq("reference", data.reference)
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const envoyerDevisEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { reference: string; token: string; lien: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("devis")
      .select("email, nom, reference, prime_ttc")
      .eq("reference", data.reference)
      .eq("token", data.token)
      .maybeSingle();
    if (!row?.email) return { ok: false as const, reason: "email_manquant" as const };

    const { envoyerDevisAuClient } = await import("./email.server");
    const result = await envoyerDevisAuClient({
      to: row.email,
      nom: row.nom,
      reference: row.reference,
      primeTTC: Number(row.prime_ttc),
      lien: data.lien,
    });
    if (result.ok) {
      await supabaseAdmin
        .from("devis")
        .update({ email_envoye_le: new Date().toISOString() })
        .eq("reference", data.reference);
    }
    return result;
  });
