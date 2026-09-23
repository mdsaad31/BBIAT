import React from "react";

export default function RiskBadge({ tier }) {
  const config = {
    Normal: { bg: "#10b981", label: "NORMAL" },
    Watch: { bg: "#f59e0b", label: "WATCH" },
    "High Risk": { bg: "#ef4444", label: "HIGH RISK" },
  };

  const { bg, label } = config[tier] || { bg: "#6b7280", label: tier || "N/A" };

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: bg,
        color: "#fff",
        padding: "2px 10px",
        borderRadius: "3px",
        fontSize: "11px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}
