import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
from feature_extraction import extract_features
from train_model import score
from chain_reader import fetch_deployment_events

app = FastAPI(title="BBIAT AI Risk-Scoring Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_model_dir = os.path.dirname(os.path.abspath(__file__))
_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    if _model is None:
        _model = joblib.load(os.path.join(_model_dir, "model.joblib"))
        _scaler = joblib.load(os.path.join(_model_dir, "scaler.joblib"))
    return _model, _scaler


@app.get("/risk-scores")
def get_risk_scores():
    deployments = fetch_deployment_events()
    if not deployments:
        return []
    model, scaler = _load_model()
    features_df = extract_features(deployments)
    result = score(features_df, model, scaler)
    return result.to_dict(orient="records")


@app.get("/health")
def health_check():
    return {"status": "ok"}
