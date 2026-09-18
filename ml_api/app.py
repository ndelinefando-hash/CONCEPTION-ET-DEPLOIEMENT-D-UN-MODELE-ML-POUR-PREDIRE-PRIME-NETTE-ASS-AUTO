
import os
import sys
import base64
from io import BytesIO

import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# FONCTIONS UTILISÉES LORS DE LA SAUVEGARDE DU MODÈLE
# ============================================================

def log_target(y):
    return np.log1p(np.maximum(0, y))


def inverse_log_target(y):
    return np.expm1(y)


# ============================================================
# CORRECTION DU PICKLE
# ============================================================
# Le fichier .pkl cherche :
# __main__.log_target
# __main__.inverse_log_target
#
# Avec Uvicorn, app.py n'est pas __main__.
# On rattache donc explicitement les fonctions à __main__.
# ============================================================

import __main__

__main__.log_target = log_target
__main__.inverse_log_target = inverse_log_target


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "modele_final_SimpleImputer_TargetEncoding_log.pkl"
)


app = FastAPI(
    title="Tariface AI - API de prédiction de prime nette",
    description="API de prédiction de la prime nette automobile avec explicabilité SHAP.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# VARIABLES DU MODÈLE
# ============================================================

FEATURES = [
    "age_vehicule_annees",
    "duree_garantie_jours",
    "places",
    "puissance",
    "valeur_neuve",
    "valeur_venale",
    "cout_total_sinistres",
    "categorie_mère",
    "garantie",
    "segment",
    "typeinter",
    "ville",
    "marque",
]


NUMERIC_FEATURES = [
    "age_vehicule_annees",
    "duree_garantie_jours",
    "places",
    "puissance",
    "valeur_neuve",
    "valeur_venale",
    "cout_total_sinistres",
]


CATEGORICAL_FEATURES = [
    "categorie_mère",
    "garantie",
    "segment",
    "typeinter",
    "ville",
    "marque",
]


# ============================================================
# CHARGEMENT DU MODÈLE
# ============================================================

print("Chargement du modèle...")

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Modèle introuvable : {MODEL_PATH}"
    )


model = joblib.load(MODEL_PATH)

print("Modèle chargé avec succès.")


# ============================================================
# EXTRACTION DU PRÉPROCESSEUR
# ============================================================

try:

    preprocessor = model.named_steps["preprocessing"]

    target_regressor = model.named_steps["regressor"]

    rf_model = getattr(
        target_regressor,
        "regressor_",
        target_regressor.regressor
    )

    print("Préprocesseur récupéré avec succès.")
    print("Random Forest récupéré avec succès.")

except Exception as e:

    raise RuntimeError(
        "Impossible d'extraire le préprocesseur et le Random Forest : "
        + str(e)
    )


# ============================================================
# SHAP
# ============================================================

try:

    explainer = shap.TreeExplainer(
        rf_model
    )

    print("Explainer SHAP initialisé avec succès.")

except Exception as e:

    explainer = None

    print(
        "Erreur initialisation SHAP :",
        repr(e)
    )


# ============================================================
# STRUCTURE DES DONNÉES
# ============================================================

class PredictionInput(BaseModel):

    age_vehicule_annees: float

    duree_garantie_jours: float

    places: float

    puissance: float

    valeur_neuve: float

    valeur_venale: float

    cout_total_sinistres: float

    categorie_mère: str

    garantie: str

    segment: str

    typeinter: str

    ville: str

    marque: str


# ============================================================
# DATAFRAME
# ============================================================

def create_dataframe(
    data: PredictionInput
):

    row = {

        "age_vehicule_annees":
            data.age_vehicule_annees,

        "duree_garantie_jours":
            data.duree_garantie_jours,

        "places":
            data.places,

        "puissance":
            data.puissance,

        "valeur_neuve":
            data.valeur_neuve,

        "valeur_venale":
            data.valeur_venale,

        "cout_total_sinistres":
            data.cout_total_sinistres,

        "categorie_mère":
            data.categorie_mère,

        "garantie":
            data.garantie,

        "segment":
            data.segment,

        "typeinter":
            data.typeinter,

        "ville":
            data.ville,

        "marque":
            data.marque,
    }

    return pd.DataFrame(
        [row],
        columns=FEATURES
    )


# ============================================================
# NOMS DES VARIABLES
# ============================================================

def get_feature_names():

    try:

        names = (
            preprocessor
            .get_feature_names_out()
        )

        cleaned_names = []

        for name in names:

            name = str(name)

            if "__" in name:

                name = name.split(
                    "__",
                    1
                )[1]

            cleaned_names.append(
                name
            )

        return np.array(
            cleaned_names
        )

    except Exception:

        return np.array(
            FEATURES
        )


# ============================================================
# FORMAT FCFA
# ============================================================

def format_fcfa(value):

    return (
        f"{float(value):,.0f}"
        .replace(",", " ")
        + " FCFA"
    )


# ============================================================
# CALCUL SHAP
# ============================================================

def calculate_shap(df):

    if explainer is None:

        return {

            "available": False,

            "message":
                "Explainer SHAP indisponible.",

            "image_url": None,

            "contributions": [],
        }


    try:

        # ----------------------------------------------------
        # TRANSFORMATION DES VARIABLES
        # ----------------------------------------------------

        X_processed = (
            preprocessor
            .transform(df)
        )


        if hasattr(
            X_processed,
            "toarray"
        ):

            X_processed = (
                X_processed.toarray()
            )


        X_processed = np.asarray(
            X_processed
        )


        # ----------------------------------------------------
        # PRÉDICTION RANDOM FOREST
        # ----------------------------------------------------

        prediction_log = float(
            rf_model
            .predict(X_processed)[0]
        )


        # ----------------------------------------------------
        # SHAP
        # ----------------------------------------------------

        shap_values = (
            explainer
            .shap_values(
                X_processed
            )
        )


        shap_values = np.asarray(
            shap_values
        )


        if shap_values.ndim == 3:

            shap_row = (
                shap_values[0, :, 0]
            )

        elif shap_values.ndim == 2:

            shap_row = (
                shap_values[0]
            )

        else:

            shap_row = (
                shap_values.reshape(-1)
            )


        # ----------------------------------------------------
        # VALEUR DE BASE
        # ----------------------------------------------------

        expected_value = (
            explainer.expected_value
        )


        if isinstance(
            expected_value,
            np.ndarray
        ):

            expected_value = float(
                expected_value
                .reshape(-1)[0]
            )

        else:

            expected_value = float(
                expected_value
            )


        # ----------------------------------------------------
        # NOMS DES VARIABLES
        # ----------------------------------------------------

        feature_names = (
            get_feature_names()
        )


        if len(feature_names) != len(
            shap_row
        ):

            feature_names = np.array(
                FEATURES[:len(shap_row)]
            )


        # ----------------------------------------------------
        # VALEURS ORIGINALES
        # ----------------------------------------------------

        feature_values = (
            df.iloc[0].values
        )


        # ----------------------------------------------------
        # CONTRIBUTIONS
        # ----------------------------------------------------

        contributions = []


        for i in range(
            len(shap_row)
        ):

            contributions.append({

                "feature":
                    str(feature_names[i]),

                "value":
                    str(feature_values[i]),

                "shap_value":
                    float(shap_row[i]),

                "abs_shap_value":
                    float(
                        abs(shap_row[i])
                    ),
            })


        contributions = sorted(

            contributions,

            key=lambda x:
                x["abs_shap_value"],

            reverse=True
        )


        # ----------------------------------------------------
        # EXPLICATION SHAP
        # ----------------------------------------------------

        shap_explanation = (
            shap.Explanation(

                values=shap_row,

                base_values=
                    expected_value,

                data=feature_values,

                feature_names=
                    feature_names,
            )
        )


        # ----------------------------------------------------
        # GRAPHIQUE WATERFALL
        # ----------------------------------------------------

        plt.close("all")


        shap.plots.waterfall(

            shap_explanation,

            max_display=len(
                shap_row
            ),

            show=False,
        )


        plt.title(

            "Explication SHAP de la prédiction de la prime nette",

            fontsize=14,

            pad=20,
        )


        plt.tight_layout()


        # ----------------------------------------------------
        # IMAGE PNG
        # ----------------------------------------------------

        buffer = BytesIO()


        plt.savefig(

            buffer,

            format="png",

            dpi=150,

            bbox_inches="tight",
        )


        plt.close("all")


        buffer.seek(0)


        image_base64 = (
            base64.b64encode(
                buffer.read()
            )
            .decode("utf-8")
        )


        image_url = (
            "data:image/png;base64,"
            + image_base64
        )


        # ----------------------------------------------------
        # RÉSULTAT
        # ----------------------------------------------------

        return {

            "available": True,

            "image_url":
                image_url,

            "expected_value_log":
                expected_value,

            "prediction_log":
                prediction_log,

            "contributions":
                contributions,
        }


    except Exception as e:

        print(
            "Erreur SHAP :",
            repr(e)
        )


        return {

            "available": False,

            "message":
                str(e),

            "image_url":
                None,

            "contributions":
                [],
        }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {

        "status":
            "ok",

        "model_loaded":
            True,

        "shap_available":
            explainer is not None,
    }


# ============================================================
# INFORMATIONS MODÈLE
# ============================================================

@app.get("/model-info")
def model_info():

    return {

        "model":
            "Random Forest",

        "target":
            "primnett",

        "target_description":
            "Prime nette associée à chaque garantie",

        "target_transformation":
            "log(1 + y)",

        "preprocessing": [

            "Imputation médiane des variables numériques",

            "Imputation par modalité la plus fréquente des variables catégorielles",

            "Target Encoding des variables catégorielles",
        ],

        "numeric_features":
            NUMERIC_FEATURES,

        "categorical_features":
            CATEGORICAL_FEATURES,

        "features":
            FEATURES,
    }


# ============================================================
# PRÉDICTION
# ============================================================

@app.post("/predict")
def predict(
    data: PredictionInput
):

    try:

        # ----------------------------------------------------
        # DATAFRAME
        # ----------------------------------------------------

        df = create_dataframe(
            data
        )


        # ----------------------------------------------------
        # PRÉDICTION
        # ----------------------------------------------------

        prediction = (
            model.predict(df)
        )


        predicted_premium = float(

            np.asarray(
                prediction
            )
            .reshape(-1)[0]
        )


        predicted_premium = max(

            0.0,

            predicted_premium
        )


        # ----------------------------------------------------
        # SHAP
        # ----------------------------------------------------

        shap_result = calculate_shap(
            df
        )


        # ----------------------------------------------------
        # RÉPONSE
        # ----------------------------------------------------

        return {

            "success":
                True,

            "prediction": {

                "target":
                    "primnett",

                "target_label":
                    "Prime nette",

                "value":
                    predicted_premium,

                "formatted":
                    format_fcfa(
                        predicted_premium
                    ),
            },

            "shap":
                shap_result,

            "input":
                df.iloc[0].to_dict(),
        }


    except Exception as e:

        print(
            "Erreur prédiction :",
            repr(e)
        )


        raise HTTPException(

            status_code=500,

            detail=
                f"Erreur lors de la prédiction : {str(e)}",
        )


# ============================================================
# EXPLICATION SHAP
# ============================================================

@app.post("/explain")
def explain(
    data: PredictionInput
):

    try:

        df = create_dataframe(
            data
        )


        prediction = (
            model.predict(df)
        )


        predicted_premium = float(

            np.asarray(
                prediction
            )
            .reshape(-1)[0]
        )


        predicted_premium = max(

            0.0,

            predicted_premium
        )


        shap_result = calculate_shap(
            df
        )


        return {

            "success":
                True,

            "prime_nette_predite":
                predicted_premium,

            "prime_nette_formatee":
                format_fcfa(
                    predicted_premium
                ),

            "shap":
                shap_result,
        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=
                f"Erreur lors de l'explication SHAP : {str(e)}",
        )


# ============================================================
# LANCEMENT
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(

        "app:app",

        host="127.0.0.1",

        port=8000,

        reload=True,
    )




