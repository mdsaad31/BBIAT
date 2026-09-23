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

model = joblib.load("model.joblib")
scaler = joblib.load("scaler.joblib")


@app.get("/risk-scores")
def get_risk_scores():
    deployments = fetch_deployment_events()
    if not deployments:
        return []
    features_df = extract_features(deployments)
    result = score(features_df, model, scaler)
    return result.to_dict(orient="records")


@app.get("/health")
def health_check():
    return {"status": "ok"}
