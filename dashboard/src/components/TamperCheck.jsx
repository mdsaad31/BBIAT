import React, { useState, useRef } from "react";

export default function TamperCheck({ selectedDeployment, onClose }) {
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const fileInputRef = useRef(null);

  if (!selectedDeployment) return null;

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    setChecking(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const localHash = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const onChainHash = selectedDeployment.artifactHash;
      const match = localHash === onChainHash;

      setResult({
        match,
        localHash,
        onChainHash,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="tamper-overlay">
      <div className="tamper-modal">
        <div className="tamper-header">
          <h3>Artifact Verification</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="tamper-info">
          <div className="info-row">
            <span className="info-label">Deployment</span>
            <span className="info-value mono">#{selectedDeployment.deploymentId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Build</span>
            <span className="info-value mono">{selectedDeployment.buildId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">On-Chain Hash</span>
            <span className="info-value mono hash-full">{selectedDeployment.artifactHash}</span>
          </div>
        </div>

        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          {checking ? (
            <p>Computing hash...</p>
          ) : (
            <>
              <div className="upload-icon">&#8593;</div>
              <p>Drop artifact file here or click to browse</p>
              <p className="upload-hint">SHA-256 is computed entirely in your browser</p>
            </>
          )}
        </div>

        {result && !result.error && (
          <div className={`tamper-result ${result.match ? "match" : "mismatch"}`}>
            <div className="result-status">
              {result.match ? (
                <>
                  <span className="result-icon good">&#10003;</span>
                  <span>Integrity Verified</span>
                </>
              ) : (
                <>
                  <span className="result-icon bad">&#10007;</span>
                  <span>Tampering Detected</span>
                </>
              )}
            </div>
            <div className="hash-comparison">
              <div className="hash-row">
                <span className="hash-label">File</span>
                <span className="mono">{result.localHash}</span>
              </div>
              <div className="hash-row">
                <span className="hash-label">Chain</span>
                <span className="mono">{result.onChainHash}</span>
              </div>
            </div>
          </div>
        )}

        {result && result.error && (
          <div className="tamper-result mismatch">
            <p>Error: {result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
