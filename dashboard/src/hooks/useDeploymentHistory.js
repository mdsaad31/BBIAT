import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL } from "../contractConfig";

export function useDeploymentHistory() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const filter = contract.filters.DeploymentRecorded();
      const events = await contract.queryFilter(filter, 0, "latest");

      const parsed = events.map((e) => ({
        deploymentId: Number(e.args.deploymentId),
        commitHash: e.args.commitHash,
        buildId: e.args.buildId,
        deployer: e.args.deployer,
        timestamp: Number(e.args.timestamp),
        artifactHash: e.args.artifactHash,
      }));

      setDeployments(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { deployments, loading, error, refresh: fetchHistory };
}
