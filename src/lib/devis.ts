// Passage de la prime pure à la prime commerciale TTC (usages marché zone CIMA)
// et gestion des devis clients publiés (persistance locale navigateur).

import type { CategorieKey, GarantieKey, IntermediaireKey, ModelKey, ZoneKey } from "./actuarial";

export const CHARGEMENTS = {
  securite: 0.05, // chargement de sécurité (volatilité du risque)
  gestion: 0.15, // frais de gestion de l'assureur
  acquisition: 0.12, // commission intermédiaire
  taxe: 0.075, // taxe unique sur les contrats d'assurance
  accessoires: 5000, // frais accessoires (FCFA)
  carteRose: 1500, // carte rose CEMAC / attestation (FCFA)
};

export interface DecompositionPrime {
  primePure: number;
  chargementSecurite: number;
  fraisGestion: number;
  fraisAcquisition: number;
  primeCommercialeHT: number;
  accessoires: number;
  taxes: number;
  carteRose: number;
  primeTTC: number;
}

export function decomposerPrime(primePure: number): DecompositionPrime {
  const chargementSecurite = primePure * CHARGEMENTS.securite;
  const primeRisque = primePure + chargementSecurite;
  const base = primeRisque / (1 - CHARGEMENTS.gestion - CHARGEMENTS.acquisition);
  const fraisGestion = base * CHARGEMENTS.gestion;
  const fraisAcquisition = base * CHARGEMENTS.acquisition;
  const primeCommercialeHT = primeRisque + fraisGestion + fraisAcquisition;
  const accessoires = CHARGEMENTS.accessoires;
  const taxes = (primeCommercialeHT + accessoires) * CHARGEMENTS.taxe;
  const carteRose = CHARGEMENTS.carteRose;
  return {
    primePure,
    chargementSecurite,
    fraisGestion,
    fraisAcquisition,
    primeCommercialeHT,
    accessoires,
    taxes,
    carteRose,
    primeTTC: primeCommercialeHT + accessoires + taxes + carteRose,
  };
}

export interface DevisClient {
  reference: string;
  publieLe: string;
  statut: "publie";
  // Souscripteur
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  // Véhicule
  immatriculation: string;
  marque: string;
  modeleVehicule: string;
  categorie: CategorieKey;
  puissance: number;
  ageVehicule: number;
  places: number;
  valeurVenale: number;
  usage: string;
  // Contrat
  zone: ZoneKey;
  intermediaire: IntermediaireKey;
  renouvellement: boolean;
  effet: string;
  echeance: string;
  exposition: number;
  garanties: GarantieKey[];
  modele: ModelKey;
  // Montants
  primePureAnnuelle: number;
  primePureProrata: number;
  primeTTC: number;
}

const STORAGE_KEY = "autotarif-devis";

export function genererReference(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `AT-${stamp}-${rand}`;
}

export function lireDevis(): DevisClient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DevisClient[]) : [];
  } catch {
    return [];
  }
}

export function publierDevis(devis: DevisClient): DevisClient[] {
  const liste = [devis, ...lireDevis()].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
  return liste;
}

export function supprimerDevis(reference: string): DevisClient[] {
  const liste = lireDevis().filter((d) => d.reference !== reference);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
  return liste;
}
