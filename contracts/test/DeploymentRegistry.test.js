const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DeploymentRegistry", function () {
  let registry, owner, pipeline, stranger;

  beforeEach(async function () {
    [owner, pipeline, stranger] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("DeploymentRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("sets the deployer as owner", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("allows the owner to authorize a pipeline account", async function () {
    await registry.authorizePipeline(pipeline.address);
    expect(await registry.authorizedPipelines(pipeline.address)).to.equal(true);
  });

  it("reverts if a non-owner tries to authorize a pipeline", async function () {
    await expect(
      registry.connect(stranger).authorizePipeline(pipeline.address)
    ).to.be.revertedWith("Only owner");
  });

  it("allows an authorized pipeline to record a deployment", async function () {
    await registry.authorizePipeline(pipeline.address);
    const artifactHash = ethers.keccak256(ethers.toUtf8Bytes("test-artifact"));

    await expect(
      registry.connect(pipeline).recordDeployment("abc123", "build-42", artifactHash)
    )
      .to.emit(registry, "DeploymentRecorded")
      .withArgs(0, "abc123", "build-42", pipeline.address, anyValue, artifactHash);
  });

  it("reverts if an unauthorized account tries to record a deployment", async function () {
    const artifactHash = ethers.keccak256(ethers.toUtf8Bytes("test-artifact"));
    await expect(
      registry.connect(stranger).recordDeployment("abc123", "build-42", artifactHash)
    ).to.be.revertedWith("Not an authorized pipeline");
  });

  it("increments deployment IDs sequentially", async function () {
    await registry.authorizePipeline(pipeline.address);
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("artifact-1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("artifact-2"));

    await registry.connect(pipeline).recordDeployment("commit1", "build1", hash1);
    await expect(registry.connect(pipeline).recordDeployment("commit2", "build2", hash2))
      .to.emit(registry, "DeploymentRecorded")
      .withArgs(1, "commit2", "build2", pipeline.address, anyValue, hash2);
  });

  it("has no update or delete function (immutability by omission)", function () {
    const fnNames = registry.interface.fragments
      .filter((f) => f.type === "function")
      .map((f) => f.name);
    expect(fnNames).to.not.include("updateDeployment");
    expect(fnNames).to.not.include("deleteDeployment");
  });
});
