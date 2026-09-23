import React from "react";
import RiskBadge from "./RiskBadge";

function truncHash(hash, len = 10) {
  if (!hash) return "—";
  if (hash.length <= len) return hash;
  return hash.slice(0, len) + "...";
}

function formatTimestamp(ts) {
  const d = new Date(ts * 1000);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { date, time };
}

export default function DeploymentTable({ deployments, riskScores, onSelectDeployment }) {
  const riskMap = {};
  if (riskScores) {
    riskScores.forEach((r) => {
      riskMap[r.deploymentId] = r;
    });
  }

  if (deployments.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#9744;</div>
        <p>No deployments recorded yet.</p>
        <p className="empty-hint">Push a commit to trigger the pipeline and record on-chain.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Build ID</th>
            <th>Commit</th>
            <th>Deployer</th>
            <th>Timestamp</th>
            <th>Artifact Hash</th>
            <th>Risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {[...deployments].reverse().map((d) => {
            const risk = riskMap[d.deploymentId];
            const { date, time } = formatTimestamp(d.timestamp);
            return (
              <tr key={d.deploymentId}>
                <td className="mono">{d.deploymentId}</td>
                <td className="mono">{d.buildId}</td>
                <td className="mono commit-cell" title={d.commitHash}>
                  {truncHash(d.commitHash, 8)}
                </td>
                <td className="mono deployer-cell" title={d.deployer}>
                  {truncHash(d.deployer, 12)}
                </td>
                <td className="timestamp-cell">
                  <span className="ts-date">{date}</span>
                  <span className="ts-time">{time}</span>
                </td>
                <td className="mono hash-cell" title={d.artifactHash}>
                  {truncHash(d.artifactHash, 14)}
                </td>
                <td>
                  <RiskBadge tier={risk ? risk.risk_tier : null} />
                </td>
                <td>
                  <button
                    className="verify-btn"
                    onClick={() => onSelectDeployment(d)}
                    title="Verify this deployment's artifact"
                  >
                    Verify
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
