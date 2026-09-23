// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeploymentRegistry {
    address public owner;
    mapping(address => bool) public authorizedPipelines;
    uint256 private nextId;

    event DeploymentRecorded(
        uint256 indexed deploymentId,
        string commitHash,
        string buildId,
        address deployer,
        uint256 timestamp,
        bytes32 artifactHash
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyAuthorized() {
        require(authorizedPipelines[msg.sender], "Not an authorized pipeline");
        _;
    }

    function authorizePipeline(address pipeline) external {
        require(msg.sender == owner, "Only owner");
        authorizedPipelines[pipeline] = true;
    }

    function recordDeployment(
        string calldata commitHash,
        string calldata buildId,
        bytes32 artifactHash
    ) external onlyAuthorized {
        emit DeploymentRecorded(
            nextId, commitHash, buildId, msg.sender, block.timestamp, artifactHash
        );
        nextId++;
    }
    // No update() or delete() function exists.
    // That omission is the entire immutability guarantee.
}
