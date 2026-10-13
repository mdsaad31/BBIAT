import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

jest.mock("../hooks/useDeploymentHistory", () => ({
  useDeploymentHistory: () => ({
    deployments: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock("../api/aiRiskApi", () => ({
  fetchRiskScores: () => Promise.resolve([]),
}));

test("renders the app header", () => {
  render(<App />);
  expect(screen.getByText("BBIAT")).toBeInTheDocument();
});

test("renders the subtitle", () => {
  render(<App />);
  expect(
    screen.getByText("Blockchain-Based Immutable Audit Trail")
  ).toBeInTheDocument();
});

test("shows chain connected status when no error", () => {
  render(<App />);
  expect(screen.getByText("Chain Connected")).toBeInTheDocument();
});

test("renders the stats bar", () => {
  render(<App />);
  expect(screen.getByText("Total Deployments")).toBeInTheDocument();
});

test("renders refresh button", () => {
  render(<App />);
  expect(screen.getByText("Refresh")).toBeInTheDocument();
});

test("renders footer", () => {
  render(<App />);
  expect(
    screen.getByText(/Immutable by design/)
  ).toBeInTheDocument();
});
