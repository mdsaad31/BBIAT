const RPC_URL = process.env.REACT_APP_RPC_URL || "http://127.0.0.1:8545";
const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:8000";

let CONTRACT_ADDRESS = "";
let CONTRACT_ABI = [];

try {
  const deployed = require("../../shared/deployedContract.json");
  CONTRACT_ADDRESS = deployed.address;
  CONTRACT_ABI = deployed.abi;
} catch (e) {
  console.warn("Contract config not found — deploy the contract first.");
}

export { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL, AI_SERVICE_URL };
