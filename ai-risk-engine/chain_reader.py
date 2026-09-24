import json
import os
from web3 import Web3

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_JSON_PATH = os.getenv("CONTRACT_JSON_PATH", "../shared/deployedContract.json")


def _load_contract():
    with open(CONTRACT_JSON_PATH) as f:
        data = json.load(f)
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    contract = w3.eth.contract(address=data["address"], abi=data["abi"])
    return w3, contract


def fetch_deployment_events() -> list[dict]:
    w3, contract = _load_contract()
    logs = contract.events.DeploymentRecorded.get_logs(from_block=0)

    deployments = []
    for log in logs:
        args = log["args"]
        deployments.append(
            {
                "deploymentId": args["deploymentId"],
                "deployer": args["deployer"],
                "timestamp": args["timestamp"],
            }
        )
    return deployments
