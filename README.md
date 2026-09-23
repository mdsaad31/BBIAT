# BBIAT

**Blockchain-Based Immutable Audit Trail for CI/CD Software Deployment Pipelines**

[![Build Status](https://github.com/mdsaad31/BBIAT/actions/workflows/deploy.yml/badge.svg)](https://github.com/mdsaad31/BBIAT/actions/workflows/deploy.yml)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

Every time our CI/CD pipeline deploys an application, the deployment metadata (commit hash, build ID, artifact hash, deployer address, timestamp) gets written to an Ethereum smart contract. No one can edit or delete those records after the fact — not even the contract owner.

On top of that, an AI risk-scoring engine (Isolation Forest) reads the same on-chain history and flags deployments that look unusual — off-hours activity, burst deployments, unknown deployers — so auditors know where to look before anyone even suspects something.

## What's in the box

| Module | What it does |
|---|---|
| `app/` | Sample Node.js application (the thing being deployed) |
| `contracts/` | Solidity smart contract with Hardhat — the immutable ledger |
| `recorder/` | Script that hashes the build artifact and writes to the contract |
| `dashboard/` | React app for viewing deployment history and verifying artifacts |
| `ai-risk-engine/` | Python + FastAPI service that scores every deployment |
| `.github/workflows/` | GitHub Actions pipeline tying it all together |

## Quick start

You need Node.js 18, Python 3.11, and Ganache installed.

```bash
# 1. Clone
git clone https://github.com/mdsaad31/BBIAT.git
cd BBIAT

# 2. Start local blockchain
ganache --db ./chaindata

# 3. Deploy contract (new terminal)
cd contracts
npm install
npx hardhat run scripts/deploy.js --network localhost

# 4. Start AI engine (new terminal)
cd ai-risk-engine
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python train_model.py    # generates model files (first time only)
uvicorn serve:app --reload --port 8000

# 5. Start dashboard (new terminal)
cd dashboard
npm install
npm start
```

The dashboard opens at `http://localhost:3000`. Push a commit to trigger the full pipeline, or test the recorder manually:

```bash
cd recorder
npm install
PRIVATE_KEY=<ganache-key> RPC_URL=http://127.0.0.1:8545 COMMIT_HASH=test123 BUILD_ID=local-1 npm run record
```

## Running tests

```bash
# Smart contract tests
cd contracts && npx hardhat test

# AI module tests
cd ai-risk-engine && pytest tests/

# Dashboard component tests
cd dashboard && npm test
```

## How tamper detection works

**Reactive path:** Upload any file in the dashboard's verification modal. It computes SHA-256 in the browser and compares it against the on-chain hash. Match = clean, mismatch = tampered.

**Proactive path:** The AI engine scores every deployment based on timing patterns (hour of day, frequency, deployer history). Unusual patterns get flagged as "Watch" or "High Risk" automatically — no upload needed.

## Architecture

```
Developer → CI/CD Pipeline → Deployed App
                │
                └──> Recorder → Smart Contract (Ledger)
                                       │
                                       ├──> Dashboard (history + tamper check)
                                       └──> AI Engine (risk scores → dashboard)
```

The blockchain and AI layers sit outside the deployment path — they never block or slow down the actual deploy.

## Tech stack

- **Blockchain:** Solidity, Hardhat, Ganache, ethers.js
- **Pipeline:** GitHub Actions
- **Frontend:** React 18
- **AI:** Python 3.11, scikit-learn (Isolation Forest), FastAPI
- **Infra:** Docker Compose (optional)

## Team

| Name | Role |
|---|---|
| Md Saad | Smart Contract & Blockchain Ledger |
| Sumeet D Biradar | CI/CD Pipeline |
| J Sachin | Recorder Script & Integration |
| Zaheer Hussain | Dashboard, AI Module & QA |

Built for CSS7102 Mini Project at Presidency University.

## License

MIT
