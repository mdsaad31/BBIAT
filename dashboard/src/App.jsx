import React, { useState, useEffect } from "react";
import { useDeploymentHistory } from "./hooks/useDeploymentHistory";
import { fetchRiskScores } from "./api/aiRiskApi";
import DeploymentTable from "./components/DeploymentTable";
import TamperCheck from "./components/TamperCheck";

export default function App() {
  const { deployments, loading, error, refresh } = useDeploymentHistory();
  const [riskScores, setRiskScores] = useState(null);
  const [riskError, setRiskError] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);

  useEffect(() => {
    fetchRiskScores()
      .then(setRiskScores)
      .catch(() => setRiskError(true));
  }, [deployments]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>
            <span className="logo-block">&#9646;</span> BBIAT
          </h1>
          <span className="header-subtitle">Blockchain-Based Immutable Audit Trail</span>
        </div>
        <div className="header-right">
          <div className="status-indicators">
            <span className={`indicator ${!error ? "live" : "dead"}`}>
              {!error ? "Chain Connected" : "Chain Offline"}
            </span>
            <span className={`indicator ${!riskError ? "live" : "dead"}`}>
              {!riskError ? "AI Engine Online" : "AI Engine Offline"}
            </span>
          </div>
          <button className="refresh-btn" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <main>
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{deployments.length}</span>
            <span className="stat-label">Total Deployments</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {riskScores ? riskScores.filter((r) => r.risk_tier === "High Risk").length : "—"}
            </span>
            <span className="stat-label">High Risk</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {riskScores ? riskScores.filter((r) => r.risk_tier === "Watch").length : "—"}
            </span>
            <span className="stat-label">Watch</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {riskScores ? riskScores.filter((r) => r.risk_tier === "Normal").length : "—"}
            </span>
            <span className="stat-label">Normal</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Connection Error:</strong> {error}
          </div>
        )}

        <section className="deployments-section">
          <div className="section-header">
            <h2>Deployment History</h2>
            <span className="record-count">{deployments.length} records on-chain</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-bar"></div>
              <p>Reading from blockchain...</p>
            </div>
          ) : (
            <DeploymentTable
              deployments={deployments}
              riskScores={riskScores}
              onSelectDeployment={setSelectedDeployment}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>PSAIAC_103 &middot; Presidency University</span>
        <span>Immutable by design &mdash; no update, no delete</span>
      </footer>

      <TamperCheck
        selectedDeployment={selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
      />
    </div>
  );
}
