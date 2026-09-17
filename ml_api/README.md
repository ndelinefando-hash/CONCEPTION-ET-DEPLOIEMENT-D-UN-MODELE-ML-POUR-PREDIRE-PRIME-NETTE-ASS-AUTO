# API du modèle final

Cette API charge le modèle `modele_final_SimpleImputer_TargetEncoding_log.pkl` issu du projet final.

## Lancer

```bash
cd ml_api
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Endpoint principal : `POST http://localhost:8000/predict`

Le modèle utilise les 13 variables du pipeline final : 7 numériques et 6 catégorielles.
