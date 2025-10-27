Push Ninja
<div align="center">
A blockchain-powered token slicing game built on Push Onchain


React

</div>
About The Project
Push Ninja is an interactive blockchain gaming experience that brings the excitement of slicing tokens—similar to Fruit Ninja—into the Web3 world. Built on Push Onchain, the game lets players slice flying tokens, dodge bombs, and mint their high scores as NFTs stored directly on-chain.

Key Features
Intuitive Slash Mechanics – Slice tokens using mouse or touch gestures

Strategic Gameplay – Avoid bombs and aim for maximum combos

NFT Minting – Record your achievements permanently on Push Onchain

Wallet Integration – Connect with Push Wallet seamlessly

Achievement System – Track performance, combos, and best scores

Real-time Scoring – Dynamic score tracking with combo multipliers

Responsive Design – Play anytime, on any device

Tech Stack
Frontend
React 18.2.0 – Modern UI framework

Ethers.js / Web3.js – Blockchain interaction layer

Custom Hooks – For state and gameplay logic

CSS3 Animations – Smooth slicing effects

Smart Contracts

Solidity 0.8+ – Smart contract language

Hardhat – Development and deployment environment

OpenZeppelin – Secure ERC721 implementation

Blockchain

Push Onchain – The decentralized layer for dApps and NFT minting

ERC721 NFT Standard – On-chain storage of achievements

🎯 Game Mechanics

Scoring System
Token Slice: +10 points

Combo Multiplier: Score × combo count

Bomb Penalty: Lose one life

NFT Metadata
Each NFT minted represents your game session and stores:

Final Score

Maximum Combo

Tokens Sliced

Bombs Hit

Game Duration

Timestamp

Installation
Prerequisites
Node.js ≥ 16.0.0

npm or yarn

Git

Push Wallet (for onchain interaction)

Setup
Clone the repository

bash
Copy code
git clone https://github.com/yourusername/push-ninja.git
cd push-ninja
Install dependencies

bash
Copy code
npm install
Configure environment

bash
Copy code
cp .env.example .env
Update .env with your Push Onchain details:

env
Copy code
REACT_APP_PUSH_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_PUSH_RPC_URL=https://rpc.push.org
REACT_APP_PUSH_NETWORK=push-onchain
Start development server

bash
Copy code
npm start
Then open http://localhost:3000

Smart Contract Deployment
Prerequisites
Hardhat installed

Funded Push Wallet

Deploy Contract
Navigate to contracts directory

bash
Copy code
cd contracts
Compile contracts

bash
Copy code
npx hardhat compile
Deploy to Push Onchain

bash
Copy code
npx hardhat run scripts/deploy.js --network push
Update frontend

Add contract address to .env

Replace ABI in src/contract_abi.json

How to Play
Connect Wallet

Click “Connect Wallet”

Select Push Wallet

Approve connection

Start Game

Click “Start Playing”

Slice flying tokens and avoid bombs

Build Combos

Slice multiple tokens rapidly

More combos = higher score

Mint NFT

After the round ends, click “Mint Game NFT”

Approve the transaction on Push Wallet

Your performance is now permanently stored onchain

View NFT Collection

Open the “My NFTs” tab

See your scores and tokenized achievements

📁 Project Structure
bash
Copy code
push-ninja/
├── public/               # Static assets
├── src/
│   ├── components/       # UI Components
│   │   ├── GameScreen.js
│   │   ├── ResultsScreen.js
│   │   ├── PushWallet.js
│   │   └── ...
│   ├── hooks/            # Game logic & state
│   ├── services/         # Blockchain integration
│   │   └── pushService.js
│   ├── styles/           # CSS & animations
│   ├── App.js
│   └── index.js
├── contracts/
│   ├── PushNinjaNFT.sol
│   ├── hardhat.config.js
│   └── scripts/deploy.js
├── .env.example
├── package.json
└── README.md
Deployment
Deploy to Vercel
Quick Deploy:

bash
Copy code
npm install -g vercel
vercel login
vercel --prod
Or manually via dashboard:

Push code to GitHub

Import at vercel.com/new

Add environment variables

Deploy!

Required Environment Variables:

REACT_APP_PUSH_CONTRACT_ADDRESS

REACT_APP_PUSH_RPC_URL

REACT_APP_PUSH_NETWORK

Built With
Technology	Purpose
React	Frontend UI framework
Ethers.js	Blockchain SDK
Solidity	Smart contract language
Hardhat	Build & deployment tools
Push Onchain	Blockchain infrastructure
Vercel	Hosting platform

Acknowledgments
Push Protocol – Powering communication and onchain interactions

OpenZeppelin – Secure and audited smart contract libraries

Ethers.js – Ethereum JavaScript library

Vercel – Seamless hosting and CI/CD

🎯 Roadmap
 Core gameplay mechanics

 Push Wallet integration

 NFT minting support

 Leaderboard system

 Multiplayer tournaments

 Custom token skins

 Mobile adaptation

 Onchain rewards & XP system

📊 Stats
Smart Contract Address: 0xYourContractAddress
Network: Push Onchain Testnet / Mainnet
Explorer: View on PushScan

<div align="center">
Push Ninja — Slice. Score. Earn. Onchain.

</div>