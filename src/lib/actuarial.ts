export type GarantieKey = string;

export interface PrimeInput {
  age_vehicule_annees: number;
  duree_garantie_jours: number;
  places: number;
  puissance: number;
  valeur_neuve: number;
  valeur_venale: number;
  cout_total_sinistres: number;
  categorie_mère: string;
  garantie: string;
  segment: string;
  typeinter: string;
  ville: string;
  marque: string;
}

export interface PredictionResult {
  prime_nette_fcfa: number;
  modele: string;
  cible: string;
  historique_sinistres_fcfa: number;
  message: string;
}

export const CATEGORIES = [
  "Tourisme (VP)", "Flotte pro", "Utilitaire < 3.5T", "Utilitaire > 3.5T",
  "Autocars / Bus", "Ambulances / Funéraire", "Navette (personnel/élèves)",
  "Engins chantier", "Taxis",
];

export const GARANTIES = [
  "Dommages", "Vol total + partiel + braquage", "Incendie", "Assistance (réparation/sinistre)",
  "Bris de glace", "Vol total + partiel", "Bris de glace + blocs feux", "Recours / Défense",
  "Avance sur recours", "Transport de personnes", "Vol total", "Accident conducteur",
  "Dommages 1er risque", "Tracking", "Tierce collision", "Remorquage", "Recours tiers incendie",
];

export const SEGMENTS = ["GENERALISTE", "POIDS_LOURD", "PREMIUM", "DEUX_ROUES", "AUTRE", "SUV_4X4"];
export const TYPES_INTER = ["Bureau Direct", "Courtier", "Agent Général"];
export const VILLES = ["YAOUNDE", "DOUALA", "KRIBI", "GAROUA", "LIMBÉ", "KOUSSÉRI", "BAFOUSSAM", "BUÉA", "BAFANG", "BAMENDA", "MAROUA", "AUTRE", "KUMBA", "BERTOUA"];
export const MARQUES = ["TOYOTA", "SINOTRUCK", "SUZUKI", "SHACMAN", "MITSUBISHI", "HYUNDAI", "PEUGEOT", "HOWO", "FORD", "MERCEDES", "FOTON", "NISSAN", "ISUZU", "YAMAHA", "KIA", "JAC", "RENAULT", "HINO", "LEXUS", "LAND ROVER", "JEEP", "DONGFENG", "VOLVO", "IVECO", "AUDI", "MAN", "VOLKSWAGEN", "BMW", "AUTRE"];

export const FINAL_METRICS = {
  rmse: 186041.48,
  mae: 102011.94,
  rmsle: 0.5594,
  r2: 0.5066,
  underestimation: 64.64,
  penalty: 116752.85,
};

export const FEATURE_LABELS = [
  "Âge du véhicule", "Durée de garantie", "Nombre de places", "Puissance",
  "Valeur neuve", "Valeur vénale", "Coût total des sinistres passés",
  "Catégorie mère", "Garantie", "Segment", "Type d'intervention", "Ville", "Marque",
];

export const fcfa = (v: number, digits = 0) =>
  `${v.toLocaleString("fr-FR", { maximumFractionDigits: digits, minimumFractionDigits: digits })} FCFA`;

const API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";


export async function predirePrime(input: PrimeInput): Promise<PredictionResult> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Le service du modèle n'est pas disponible.");
  }

  const data = await response.json();

  // Sauvegarde de la prédiction complète pour la page d'explicabilité
  localStorage.setItem(
    "tariface_last_prediction",
    JSON.stringify(data)
  );

  // Adaptation de la réponse API au format attendu par le simulateur
  return {
    prime_nette_fcfa: data.prediction?.value ?? 0,
    modele: data.prediction?.model ?? "Random Forest",
    cible: data.prediction?.target ?? "primnett",
    historique_sinistres_fcfa: input.cout_total_sinistres,
    message:
      data.prediction?.message ??
      "Prime nette estimée à partir du modèle final.",
  };
}

