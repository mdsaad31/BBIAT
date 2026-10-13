import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TamperCheck from "../components/TamperCheck";

const mockDeployment = {
  deploymentId: 1,
  buildId: "build-001",
  artifactHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
};

test("renders nothing when no deployment is selected", () => {
  const { container } = render(
    <TamperCheck selectedDeployment={null} onClose={() => {}} />
  );
  expect(container.firstChild).toBeNull();
});

test("renders modal when deployment is selected", () => {
  render(
    <TamperCheck selectedDeployment={mockDeployment} onClose={() => {}} />
  );
  expect(screen.getByText("Artifact Verification")).toBeInTheDocument();
});

test("displays deployment ID and build ID", () => {
  render(
    <TamperCheck selectedDeployment={mockDeployment} onClose={() => {}} />
  );
  expect(screen.getByText("#1")).toBeInTheDocument();
  expect(screen.getByText("build-001")).toBeInTheDocument();
});

test("displays the on-chain hash", () => {
  render(
    <TamperCheck selectedDeployment={mockDeployment} onClose={() => {}} />
  );
  expect(screen.getByText(mockDeployment.artifactHash)).toBeInTheDocument();
});

test("shows upload instructions", () => {
  render(
    <TamperCheck selectedDeployment={mockDeployment} onClose={() => {}} />
  );
  expect(
    screen.getByText("SHA-256 is computed entirely in your browser")
  ).toBeInTheDocument();
});
