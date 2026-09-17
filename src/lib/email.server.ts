// Envoi de l'e-mail de devis au client.
// Tant qu'aucun domaine d'envoi n'est configuré pour le projet, la fonction
// renvoie un statut explicite au lieu d'échouer silencieusement.

export interface EnvoiDevisInput {
  to: string;
  nom: string;
  reference: string;
  primeTTC: number;
  lien: string;
}

export type ResultatEnvoi =
  | { ok: true }
  | { ok: false; reason: "email_manquant" | "email_non_configure"; message?: string };

export async function envoyerDevisAuClient(_input: EnvoiDevisInput): Promise<ResultatEnvoi> {
  return {
    ok: false,
    reason: "email_non_configure",
    message: "Aucun domaine d'envoi d'e-mails n'est encore configuré pour ce projet.",
  };
}
