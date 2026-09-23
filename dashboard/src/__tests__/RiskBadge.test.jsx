import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RiskBadge from "../components/RiskBadge";

test("renders HIGH RISK badge with correct text", () => {
  render(<RiskBadge tier="High Risk" />);
  expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
});

test("renders NORMAL badge", () => {
  render(<RiskBadge tier="Normal" />);
  expect(screen.getByText("NORMAL")).toBeInTheDocument();
});

test("renders WATCH badge", () => {
  render(<RiskBadge tier="Watch" />);
  expect(screen.getByText("WATCH")).toBeInTheDocument();
});

test("falls back to gray for unknown tier", () => {
  render(<RiskBadge tier="Unknown" />);
  const badge = screen.getByText("Unknown");
  expect(badge).toHaveStyle({ backgroundColor: "#6b7280" });
});

test("shows N/A for null tier", () => {
  render(<RiskBadge tier={null} />);
  expect(screen.getByText("N/A")).toBeInTheDocument();
});
