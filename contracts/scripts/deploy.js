const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DeploymentRegistry with account:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("DeploymentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("DeploymentRegistry deployed to:", address);

  const pipelineAddress = process.env.PIPELINE_ACCOUNT_ADDRESS || deployer.address;
  const tx = await registry.authorizePipeline(pipelineAddress);
  await tx.wait();
  console.log("Authorized pipeline account:", pipelineAddress);

  const artifact = await hre.artifacts.readArtifact("DeploymentRegistry");
  const exportData = { address, abi: artifact.abi };

  const outPath = path.join(__dirname, "../../shared/deployedContract.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const json = JSON.stringify(exportData, null, 2);
  fs.writeFileSync(outPath, json);
  console.log("Contract address + ABI exported to shared/deployedContract.json");

  const dashboardCopy = path.join(__dirname, "../../dashboard/src/deployedContract.json");
  if (fs.existsSync(path.dirname(dashboardCopy))) {
    fs.writeFileSync(dashboardCopy, json);
    console.log("Contract config copied to dashboard/src/deployedContract.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
