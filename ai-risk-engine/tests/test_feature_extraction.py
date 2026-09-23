import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from feature_extraction import extract_features


def test_cold_start_deployment_gets_large_gap_value():
    deployments = [{"deploymentId": 0, "deployer": "0xNew", "timestamp": 1700000000}]
    df = extract_features(deployments)
    assert df.iloc[0]["minutes_since_last_deploy"] == 9999


def test_features_include_all_expected_columns():
    deployments = [{"deploymentId": 0, "deployer": "0xA", "timestamp": 1700000000}]
    df = extract_features(deployments)
    expected_cols = {
        "deploymentId",
        "hour_of_day",
        "day_of_week",
        "minutes_since_last_deploy",
        "deploys_in_last_60min",
        "deployer_historical_avg_interval_minutes",
    }
    assert expected_cols.issubset(set(df.columns))


def test_multiple_deployments_compute_interval():
    deployments = [
        {"deploymentId": 0, "deployer": "0xA", "timestamp": 1700000000},
        {"deploymentId": 1, "deployer": "0xA", "timestamp": 1700003600},
    ]
    df = extract_features(deployments)
    second_row = df[df["deploymentId"] == 1].iloc[0]
    assert second_row["minutes_since_last_deploy"] == 60.0


def test_burst_deployments_counted_correctly():
    base = 1700000000
    deployments = [
        {"deploymentId": i, "deployer": "0xA", "timestamp": base + (i * 300)}
        for i in range(5)
    ]
    df = extract_features(deployments)
    last_row = df.iloc[-1]
    assert last_row["deploys_in_last_60min"] >= 4
