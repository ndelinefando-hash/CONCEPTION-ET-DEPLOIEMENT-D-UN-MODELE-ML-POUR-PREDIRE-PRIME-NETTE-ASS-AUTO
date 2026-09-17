# Zenithe Prime AI

Application de démonstration du projet final : **Conception et déploiement d’un modèle de Machine Learning pour la prédiction de la prime nette en assurance automobile : cas du Cameroun**.

## Modèle utilisé
- cible : `primnett` / prime nette associée à la garantie ;
- Random Forest final ;
- imputation simple : médiane / modalité la plus fréquente ;
- Target Encoding ;
- transformation de la cible `log(1 + y)` ;
- 13 variables explicatives, dont `cout_total_sinistres` représentant l'expérience des sinistres antérieurs.

## Résultats finaux
- RMSE test : 186 041,48 FCFA
- MAE test : 102 011,94 FCFA
- RMSLE : 0,5594
- R² : 0,5066
- taux de sous-estimation : 64,64 %

## Lancement

### 1. API du modèle
```bash
cd ml_api
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### 2. Interface
Dans un autre terminal :
```bash
bun install
bun run dev
```

Puis ouvrir l'URL indiquée par Vite.

L'interface appelle `http://localhost:8000/predict` par défaut. Pour changer l'adresse :
```bash
VITE_ML_API_URL=http://localhost:8000
```
