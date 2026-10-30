import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


def _make_client():
    from serve import app

    return TestClient(app)


def _mock_model():
    """Return mock model+scaler that produce valid scores."""
    import numpy as np

    model = MagicMock()
    scaler = MagicMock()
    scaler.transform.side_effect = lambda x: x
    model.decision_function.side_effect = lambda x: np.random.randn(len(x))
    return model, scaler


def test_health_endpoint():
    m, s = _mock_model()
    with patch("serve._load_model", return_value=(m, s)):
        client = _make_client()
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_risk_scores_returns_list():
    mock_events = [
        {"deploymentId": 0, "deployer": "0xA", "timestamp": 1700000000},
        {"deploymentId": 1, "deployer": "0xA", "timestamp": 1700003600},
    ]
    m, s = _mock_model()

    with patch("serve._load_model", return_value=(m, s)), patch(
        "serve.fetch_deployment_events", return_value=mock_events
    ):
        client = _make_client()
        response = client.get("/risk-scores")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2


def test_risk_scores_contains_required_fields():
    mock_events = [
        {"deploymentId": 0, "deployer": "0xA", "timestamp": 1700000000},
        {"deploymentId": 1, "deployer": "0xA", "timestamp": 1700003600},
    ]
    m, s = _mock_model()

    with patch("serve._load_model", return_value=(m, s)), patch(
        "serve.fetch_deployment_events", return_value=mock_events
    ):
        client = _make_client()
        response = client.get("/risk-scores")
        data = response.json()
        for entry in data:
            assert "deploymentId" in entry
            assert "risk_score" in entry
            assert "risk_tier" in entry


def test_risk_scores_empty_when_no_events():
    m, s = _mock_model()
    with patch("serve._load_model", return_value=(m, s)), patch(
        "serve.fetch_deployment_events", return_value=[]
    ):
        client = _make_client()
        response = client.get("/risk-scores")
        assert response.status_code == 200
        assert response.json() == []


def test_risk_tier_values_are_valid():
    mock_events = [
        {"deploymentId": i, "deployer": "0xA", "timestamp": 1700000000 + i * 3600}
        for i in range(10)
    ]
    m, s = _mock_model()

    with patch("serve._load_model", return_value=(m, s)), patch(
        "serve.fetch_deployment_events", return_value=mock_events
    ):
        client = _make_client()
        response = client.get("/risk-scores")
        data = response.json()
        valid_tiers = {"Normal", "Watch", "High Risk"}
        for entry in data:
            assert entry["risk_tier"] in valid_tiers
