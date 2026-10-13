import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeploymentTable from "../components/DeploymentTable";

const mockDeployments = [
  {
    deploymentId: 1,
    commitHash: "abc1234567890",
    buildId: "build-001",
    deployer: "0x1234567890abcdef1234567890abcdef12345678",
    timestamp: 1700000000,
    artifactHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
  {
    deploymentId: 2,
    commitHash: "def5678901234",
    buildId: "build-002",
    deployer: "0xabcdef1234567890abcdef1234567890abcdef12",
    timestamp: 1700003600,
    artifactHash: "0xcafebabe1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
];

const mockRiskScores = [
  { deploymentId: 1, risk_score: 0.15, risk_tier: "Normal" },
  { deploymentId: 2, risk_score: -0.08, risk_tier: "Watch" },
];

test("renders empty state when no deployments", () => {
  render(
    <DeploymentTable deployments={[]} riskScores={null} onSelectDeployment={() => {}} />
  );
  expect(screen.getByText("No deployments recorded yet.")).toBeInTheDocument();
});

test("renders deployment rows with correct data", () => {
  render(
    <DeploymentTable
      deployments={mockDeployments}
      riskScores={mockRiskScores}
      onSelectDeployment={() => {}}
    />
  );
  expect(screen.getByText("build-001")).toBeInTheDocument();
  expect(screen.getByText("build-002")).toBeInTheDocument();
});

test("renders risk badges from risk scores", () => {
  render(
    <DeploymentTable
      deployments={mockDeployments}
      riskScores={mockRiskScores}
      onSelectDeployment={() => {}}
    />
  );
  expect(screen.getByText("NORMAL")).toBeInTheDocument();
  expect(screen.getByText("WATCH")).toBeInTheDocument();
});

test("renders N/A badges when risk scores are null", () => {
  render(
    <DeploymentTable
      deployments={mockDeployments}
      riskScores={null}
      onSelectDeployment={() => {}}
    />
  );
  const naBadges = screen.getAllByText("N/A");
  expect(naBadges).toHaveLength(2);
});

test("renders a Verify button for each deployment", () => {
  render(
    <DeploymentTable
      deployments={mockDeployments}
      riskScores={mockRiskScores}
      onSelectDeployment={() => {}}
    />
  );
  const buttons = screen.getAllByText("Verify");
  expect(buttons).toHaveLength(2);
});

test("truncates long hashes in the table", () => {
  render(
    <DeploymentTable
      deployments={mockDeployments}
      riskScores={mockRiskScores}
      onSelectDeployment={() => {}}
    />
  );
  expect(screen.getByText("abc12345...")).toBeInTheDocument();
});
