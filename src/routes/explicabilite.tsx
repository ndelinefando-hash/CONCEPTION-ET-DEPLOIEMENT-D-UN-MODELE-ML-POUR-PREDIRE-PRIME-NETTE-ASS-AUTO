
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Database,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/explicabilite")({
  head: () => ({
    meta: [
      {
        title: "Explicabilité SHAP — Tariface AI",
      },
      {
        name: "description",
        content:
          "Explication dynamique d'une prédiction individuelle de prime nette par la méthode SHAP.",
      },
    ],
  }),

  component: Explicabilite,
});


/* ============================================================
   TYPES
   ============================================================ */

type ShapContribution = {
  feature: string;
  value: string;
  shap_value: number;
  abs_shap_value: number;
};


type PredictionResponse = {
  success: boolean;

  prediction: {
    target: string;
    target_label: string;
    value: number;
    formatted: string;
  };

  shap: {
    available: boolean;
    image_url: string | null;
    expected_value_log?: number;
    prediction_log?: number;
    contributions: ShapContribution[];
    message?: string;
  };
};


/* ============================================================
   CONFIGURATION API
   ============================================================ */

const API_URL = "http://127.0.0.1:8000";


/* ============================================================
   DERNIÈRE PRÉDICTION DE DÉMONSTRATION
   ============================================================
   
   Cette fonction récupère la dernière prédiction sauvegardée
   par le simulateur.

   Si aucune prédiction n'est disponible, la page indique
   à l'utilisateur de lancer d'abord une simulation.
   ============================================================ */

function getStoredPrediction(): PredictionResponse | null {
  try {
    const stored = localStorage.getItem(
      "tariface_last_prediction",
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as PredictionResponse;

  } catch (error) {
    console.error(
      "Impossible de récupérer la dernière prédiction :",
      error,
    );

    return null;
  }
}


/* ============================================================
   FORMAT SHAP
   ============================================================ */

function formatShapValue(value: number): string {
  const sign = value >= 0 ? "+" : "";

  return `${sign}${value.toFixed(4)}`;
}


/* ============================================================
   LABELS VARIABLES
   ============================================================ */

const FEATURE_LABELS: Record<string, string> = {

  age_vehicule_annees:
    "Âge du véhicule",

  duree_garantie_jours:
    "Durée de garantie",

  places:
    "Nombre de places",

  puissance:
    "Puissance",

  valeur_neuve:
    "Valeur neuve",

  valeur_venale:
    "Valeur vénale",

  cout_total_sinistres:
    "Coût des sinistres passés",

  "categorie_mère":
    "Catégorie mère",

  garantie:
    "Garantie",

  segment:
    "Segment",

  typeinter:
    "Type d'intervention",

  ville:
    "Ville",

  marque:
    "Marque",
};


function getFeatureLabel(
  feature: string,
): string {

  return (
    FEATURE_LABELS[feature] ??
    feature
  );
}


/* ============================================================
   PAGE
   ============================================================ */

function Explicabilite() {

  const [
    prediction,
    setPrediction,
  ] = useState<PredictionResponse | null>(
    null,
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  /* ----------------------------------------------------------
     RÉCUPÉRATION DE LA DERNIÈRE PRÉDICTION
     ---------------------------------------------------------- */

  useEffect(() => {

    const stored =
      getStoredPrediction();

    if (stored) {
      setPrediction(stored);
    }

  }, []);


  /* ----------------------------------------------------------
     RECHARGER
     ---------------------------------------------------------- */

  const reloadPrediction = () => {

    setError(null);

    const stored =
      getStoredPrediction();

    if (stored) {

      setPrediction(stored);

    } else {

      setPrediction(null);

      setError(
        "Aucune prédiction disponible. Lancez d'abord une simulation.",
      );
    }
  };


  /* ==========================================================
     RENDU
     ========================================================== */

  return (

    <AppShell>

      <div className="space-y-8">

        <PageHeader
          title="Explicabilité du modèle"
          subtitle="Interprétation dynamique de la prédiction de la prime nette par la méthode SHAP."
        />


        {/* ====================================================
           MODÈLE FINAL
           ==================================================== */}

        <Card className="surface-card">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <BrainCircuit className="h-5 w-5" />

              Modèle final

            </CardTitle>

            <CardDescription>

              Random Forest utilisé pour prédire la prime nette
              associée à chaque garantie.

            </CardDescription>

          </CardHeader>


          <CardContent>

            <div className="grid gap-4 md:grid-cols-3">


              <div className="rounded-xl bg-[#0B1F3A] p-5 text-white">

                <div className="flex items-center gap-2">

                  <BrainCircuit className="h-5 w-5" />

                  <span className="font-semibold">
                    Random Forest
                  </span>

                </div>

                <p className="mt-2 text-sm text-blue-100">
                  Modèle final retenu pour la prédiction
                  de la prime nette.
                </p>

              </div>


              <div className="rounded-xl border border-border p-5">

                <div className="flex items-center gap-2">

                  <Database className="h-5 w-5" />

                  <span className="font-semibold">
                    Cible
                  </span>

                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  primnett
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Prime nette associée à chaque garantie
                </p>

              </div>


              <div className="rounded-xl border border-border p-5">

                <div className="flex items-center gap-2">

                  <ShieldCheck className="h-5 w-5" />

                  <span className="font-semibold">
                    Transformation
                  </span>

                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  log(1 + prime nette)
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Les contributions SHAP sont calculées
                  sur l'échelle logarithmique.
                </p>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* ====================================================
           BOUTON ACTUALISATION
           ==================================================== */}

        <div className="flex justify-end">

          <Button
            variant="outline"
            onClick={reloadPrediction}
          >

            <RefreshCw className="mr-2 h-4 w-4" />

            Actualiser la prédiction

          </Button>

        </div>


        {/* ====================================================
           ERREUR
           ==================================================== */}

        {error && (

          <Card className="border-amber-200 bg-amber-50">

            <CardContent className="flex items-start gap-3 p-5">

              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />

              <div>

                <p className="font-semibold text-amber-900">
                  Aucune prédiction disponible
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  {error}
                </p>

              </div>

            </CardContent>

          </Card>

        )}


        {/* ====================================================
           PRÉDICTION
           ==================================================== */}

        {prediction && (

          <Card className="surface-card">

            <CardHeader>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <CardTitle>
                    Prédiction individuelle
                  </CardTitle>

                  <CardDescription>
                    Résultat correspondant à la dernière simulation effectuée.
                  </CardDescription>

                </div>


                <Badge variant="outline">

                  Prime nette

                </Badge>

              </div>

            </CardHeader>


            <CardContent>

              <div className="rounded-2xl bg-[#0B1F3A] p-7 text-white">

                <p className="text-sm text-blue-100">
                  Prime nette prédite
                </p>

                <p className="mt-2 text-4xl font-bold tracking-tight">

                  {prediction.prediction.formatted}

                </p>

                <p className="mt-2 text-xs text-blue-200">

                  Variable cible : primnett

                </p>

              </div>

            </CardContent>

          </Card>

        )}


        {/* ====================================================
           WATERFALL SHAP
           ==================================================== */}

        {prediction?.shap?.available &&
          prediction.shap.image_url && (

          <Card className="surface-card">

            <CardHeader>

              <CardTitle className="flex items-center gap-2">

                <BrainCircuit className="h-5 w-5" />

                Waterfall SHAP

              </CardTitle>

              <CardDescription>

                Explication de cette prédiction individuelle :
                chaque contribution indique comment une variable
                modifie la sortie du Random Forest par rapport
                à la valeur de référence.

              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="overflow-hidden rounded-xl border border-border bg-white p-3">

                <img
                  src={prediction.shap.image_url}
                  alt="Waterfall SHAP expliquant la prédiction de prime nette"
                  className="mx-auto h-auto w-full max-w-5xl"
                />

              </div>


              <div className="mt-4 rounded-xl bg-slate-50 p-4">

                <p className="text-sm font-semibold text-slate-900">

                  Lecture du graphique

                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">

                  Les contributions positives augmentent la sortie
                  du modèle, tandis que les contributions négatives
                  la diminuent. Les valeurs SHAP sont exprimées sur
                  l'échelle logarithmique utilisée par le modèle.

                </p>

              </div>

            </CardContent>

          </Card>

        )}


        {/* ====================================================
           CONTRIBUTIONS SHAP
           ==================================================== */}

        {prediction?.shap?.available &&
          prediction.shap.contributions?.length > 0 && (

          <Card className="surface-card">

            <CardHeader>

              <CardTitle>
                Contributions SHAP
              </CardTitle>

              <CardDescription>

                Variables classées selon l'importance absolue
                de leur contribution pour cette prédiction.

              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="space-y-3">

                {prediction.shap.contributions.map(
                  (item, index) => {

                    const positive =
                      item.shap_value >= 0;


                    return (

                      <div
                        key={`${item.feature}-${index}`}
                        className="rounded-xl border border-border p-4"
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              {positive ? (

                                <TrendingUp className="h-4 w-4 text-emerald-600" />

                              ) : (

                                <TrendingDown className="h-4 w-4 text-red-600" />

                              )}

                              <span className="font-semibold text-slate-900">

                                {getFeatureLabel(
                                  item.feature,
                                )}

                              </span>

                            </div>


                            <p className="mt-1 text-xs text-muted-foreground">

                              Valeur observée :{" "}

                              <span className="font-medium">
                                {item.value}
                              </span>

                            </p>

                          </div>


                          <div className="text-left sm:text-right">

                            <p
                              className={
                                positive
                                  ? "font-bold text-emerald-600"
                                  : "font-bold text-red-600"
                              }
                            >

                              {formatShapValue(
                                item.shap_value,
                              )}

                            </p>

                            <p className="text-xs text-muted-foreground">
                              contribution SHAP
                            </p>

                          </div>

                        </div>


                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className={
                              positive
                                ? "h-full rounded-full bg-emerald-500"
                                : "h-full rounded-full bg-red-500"
                            }
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  4,
                                  item.abs_shap_value * 100,
                                ),
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    );

                  },
                )}

              </div>

            </CardContent>

          </Card>

        )}


        {/* ====================================================
           VALEUR DE RÉFÉRENCE
           ==================================================== */}

        {prediction?.shap?.available && (

          <Card className="surface-card">

            <CardHeader>

              <CardTitle>
                Valeurs de référence SHAP
              </CardTitle>

              <CardDescription>

                Valeurs utilisées pour comprendre la décomposition
                de la prédiction.

              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-xl border border-border bg-slate-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                    Valeur de référence

                  </p>

                  <p className="mt-2 text-2xl font-bold">

                    {prediction.shap.expected_value_log !== undefined
                      ? prediction.shap.expected_value_log.toFixed(4)
                      : "—"}

                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">

                    Échelle log(1 + prime nette)

                  </p>

                </div>


                <div className="rounded-xl border border-border bg-slate-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                    Sortie du modèle

                  </p>

                  <p className="mt-2 text-2xl font-bold">

                    {prediction.shap.prediction_log !== undefined
                      ? prediction.shap.prediction_log.toFixed(4)
                      : "—"}

                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">

                    Échelle log(1 + prime nette)

                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        )}


        {/* ====================================================
           EXPLICATION MÉTHODOLOGIQUE
           ==================================================== */}

        <Card className="surface-card">

          <CardHeader>

            <CardTitle>
              Interprétation méthodologique
            </CardTitle>

            <CardDescription>
              Rôle de SHAP dans l'analyse de la prédiction.
            </CardDescription>

          </CardHeader>


          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">

            <p>

              La méthode SHAP permet de décomposer une prédiction
              individuelle en une valeur de référence et en
              contributions attribuées aux différentes variables
              explicatives.

            </p>


            <p>

              Une contribution SHAP positive indique que la variable
              augmente la sortie du modèle par rapport à la valeur
              de référence. Une contribution négative indique
              qu'elle la diminue.

            </p>


            <p>

              Dans le modèle final, la variable cible est la
              <strong className="text-foreground">
                {" "}prime nette associée à chaque garantie
              </strong>
              , notée <strong className="text-foreground">primnett</strong>.

            </p>


            <p>

              La transformation logarithmique de la cible implique
              que les contributions SHAP affichées sont interprétées
              sur l'échelle log(1 + prime nette), tandis que le
              montant présenté à l'utilisateur reste exprimé en FCFA.

            </p>

          </CardContent>

        </Card>


        {/* ====================================================
           MESSAGE FINAL
           ==================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">

              <ShieldCheck className="h-6 w-6" />

            </div>


            <div>

              <h3 className="font-semibold text-blue-900">

                Rôle de l'explicabilité

              </h3>


              <p className="mt-2 text-sm leading-6 text-blue-800">

                L'explicabilité complète la prédiction de la prime
                nette par une lecture des facteurs ayant contribué
                au résultat. Elle fournit ainsi au technicien une
                information complémentaire pour l'analyse de la
                tarification automobile.

              </p>

            </div>

          </div>

        </div>

      </div>

    </AppShell>
  );
}


export default Explicabilite;

