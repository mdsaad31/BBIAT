from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

FEATURE_COLS = [
    "hour_of_day",
    "day_of_week",
    "minutes_since_last_deploy",
    "deploys_in_last_60min",
    "deployer_historical_avg_interval_minutes",
]


def train(features_df):
    X = features_df[FEATURE_COLS]
    scaler = StandardScaler().fit(X)
    X_scaled = scaler.transform(X)

    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X_scaled)

    joblib.dump(model, "model.joblib")
    joblib.dump(scaler, "scaler.joblib")
    return model, scaler


def score(features_df, model, scaler):
    X_scaled = scaler.transform(features_df[FEATURE_COLS])
    raw_scores = model.decision_function(X_scaled)

    score_range = raw_scores.max() - raw_scores.min()
    q10 = raw_scores.min() + 0.1 * score_range
    q20 = raw_scores.min() + 0.2 * score_range
    tiers = [
        "High Risk" if s <= q10 else "Watch" if s <= q20 else "Normal"
        for s in raw_scores
    ]

    features_df = features_df.copy()
    features_df["risk_score"] = raw_scores
    features_df["risk_tier"] = tiers
    return features_df[["deploymentId", "risk_score", "risk_tier"]]


if __name__ == "__main__":
    from synthetic_data import generate_synthetic_deployments
    from feature_extraction import extract_features

    deployments = generate_synthetic_deployments()
    features = extract_features(deployments)
    model, scaler = train(features)
    result = score(features, model, scaler)
    print(result.to_string())
    print(f"\nModel saved to model.joblib, scaler saved to scaler.joblib")
