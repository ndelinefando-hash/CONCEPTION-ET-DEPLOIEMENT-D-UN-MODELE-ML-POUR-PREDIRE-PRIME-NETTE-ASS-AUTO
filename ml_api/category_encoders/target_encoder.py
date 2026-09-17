import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

class TargetEncoder(BaseEstimator, TransformerMixin):
    """Compatibilité légère pour charger le pipeline final entraîné avec category_encoders.
    Reproduit le transform de TargetEncoder pour ce pipeline figé."""
    def __setstate__(self, state):
        self.__dict__.update(state)

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = pd.DataFrame(X).copy()
        ordinal_maps = {item["col"]: item["mapping"] for item in self.ordinal_encoder.mapping}
        for col in self.cols:
            codes = df[col].map(ordinal_maps[col]).fillna(-1)
            df[col] = codes.map(self.mapping[col]).fillna(self._mean)
        return df
