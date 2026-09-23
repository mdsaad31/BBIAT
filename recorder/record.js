require("dotenv").config();
const { ethers } = require("ethers");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function log(level, message) {
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
}

function hashArtifact(filePath) {
  const buffer = fs.readFileSync(filePath);
  return "0x" + crypto.createHash("sha256").update(buffer).digest("hex");
}

async function recordWithRetry(contract, commitHash, buildId, artifactHash, attempt = 1) {
  try {
    const tx = await contract.recordDeployment(commitHash, buildId, artifactHash);
    log("INFO", `Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    log("INFO", `Confirmed in block ${receipt.blockNumber}`);
    return receipt;
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      log("ERROR", `Failed after ${MAX_RETRIES} attempts: ${err.message}`);
      throw err;
    }
    log("WARN", `Attempt ${attempt} failed (${err.message}), retrying in ${RETRY_DELAY_MS}ms...`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return recordWithRetry(contract, commitHash, buildId, artifactHash, attempt + 1);
  }
}

async function main() {
  const required = ["PRIVATE_KEY", "RPC_URL", "COMMIT_HASH", "BUILD_ID"];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  }

  const artifactPath = process.env.ARTIFACT_PATH || "../app/dist/bundle.js";
  const contractJsonPath = process.env.CONTRACT_JSON_PATH || "../shared/deployedContract.json";

  const artifactHash = hashArtifact(artifactPath);
  log("INFO", `Artifact hash: ${artifactHash}`);

  const { address, abi } = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, contractJsonPath))
  );

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(address, abi, wallet);

  await recordWithRetry(contract, process.env.COMMIT_HASH, process.env.BUILD_ID, artifactHash);
  log("INFO", "Deployment successfully recorded on-chain.");
}

main().catch((err) => {
  log("ERROR", err.stack || err.message);
  process.exit(1);
});
