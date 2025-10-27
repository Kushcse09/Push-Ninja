
# 🥷 Push Ninja

<div align="center">

**A blockchain-based slicing game built on Push Chain**



</div>

---

## 🧩 About The Project

Web3 is packed with DeFi, DAOs, and token speculation — but not enough fun.  
So, we built **Push Ninja**, a hypercasual blockchain game that revives the *Fruit Ninja* nostalgia, but entirely on-chain.  

Slice fruits, earn points and NFTs, and climb the global leaderboard — all while your assets remain **truly ownable** and gameplay is powered by **Push Chain**.

### 🔥 Key Features

- **On-Chain Gameplay** – Every slice, score, and reward lives on Push Chain  
- **NFT Collectibles** – Earn and mint slicing rewards as NFTs  
- **Leaderboard System** – Compete globally with other players  
- **Cross-Chain Ready** – Built for interoperability on Push Chain  
- **Reward Mechanics** – Earn points, NFTs, and crypto incentives  
- **Wallet Integration** – Connect via Push Wallet for secure play  

---

## 🛠 Tech Stack

### Frontend
- **JavaScript / Web3.js** – Blockchain and wallet integration  
- **HTML5 Canvas** – Game rendering and slicing mechanics  
- **CSS3** – Game UI and animation effects  

### Smart Contracts
- **Solidity (v0.8.28)** – On-chain logic and NFT minting  
- **Hardhat** – Development, testing, and deployment  

### Blockchain
- **Push Chain Testnet** – Decentralized execution layer  
- **ERC-721 Standard** – NFT-based reward representation  

---

## 🎮 Game Mechanics

### Scoring System
- **Fruit Slice:** +10 points  
- **Combo Bonus:** Points × Combo Count  
  

### NFT Metadata
Each NFT represents a unique game session containing:
- Player Address  
- Final Score  
- Highest Combo  
- Fruits Sliced  
- Missed Slices  
- Timestamp  

---

## ⚙️ Installation

### Prerequisites
- Node.js ≥ 16.0.0  
- npm or yarn  
- Git  
- Push Wallet (for testing)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kushcse09/Push-Ninja.git
   cd Push-Ninja


2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your contract and RPC details:

   ```env
   PUSH_CONTRACT_ADDRESS=0xYourContractAddress
   PUSH_NETWORK=testnet
   PUSH_RPC_URL=https://rpc-testnet.push.org
   ```

4. **Run the development server**

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 🔗 Smart Contract Deployment

### Prerequisites

* Hardhat
* Push Chain test tokens
* Funded deployer wallet

### Steps

1. **Compile contracts**

   ```bash
   npx hardhat compile
   ```

2. **Deploy to Push Chain**

   ```bash
   npx hardhat run scripts/deploy.js --network pushTestnet
   ```

3. **Update Frontend**

   * Add contract address in `.env`
   * Update `contractABI.json` in `src/config/`

---

## 🎯 How to Play

1. **Connect Wallet**

   * Click **“Connect Push Wallet”**
   * Approve connection to Push Chain Testnet

2. **Start the Game**

   * Hit **“Play”**
   * Slice fruits with your mouse or touch
   * Avoid missing too many fruits

3. **Earn Rewards**

   * Get **points** for each slice
   * Unlock **NFT collectibles**
   * Check your **leaderboard rank**

4. **Mint Your Score**

   * End game → Mint as NFT
   * Approve the transaction
   * Your slice session lives on-chain forever!

---

## 📁 Project Structure

```
push-ninja/
├── public/                # Static assets
├── src/
│   ├── components/        # UI components
│   │   ├── GameScreen.js
│   │   ├── WalletConnect.js
│   │   ├── Leaderboard.js
│   │   └── ...
│   ├── contracts/         # Smart contract ABIs
│   ├── hooks/             # Custom React/Web3 hooks
│   ├── styles/            # CSS files
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
├── contracts/             # Solidity smart contracts
│   ├── PushNinjaGame.sol
│   ├── deploy.js
│   └── hardhat.config.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Deployment

### Deploy Frontend (Vercel)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or deploy manually:

1. Push the repo to GitHub
2. Connect on [vercel.com/new](https://vercel.com/new)
3. Add environment variables
4. Click **Deploy**

**Required Env Variables:**

* `PUSH_CONTRACT_ADDRESS`
* `PUSH_NETWORK`
* `PUSH_RPC_URL`

---

## 🧱 Built With

| Technology                                                                  | Purpose                    |
| --------------------------------------------------------------------------- | -------------------------- |
| [Push Chain](https://push.org/)                                             | Blockchain layer           |
| [Solidity](https://soliditylang.org/)                                       | Smart contract development |
| [Hardhat](https://hardhat.org/)                                             | Build & deployment         |
| [Web3.js](https://web3js.readthedocs.io/)                                   | Blockchain SDK             |
| [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) | Game visuals               |
| [Vercel](https://vercel.com/)                                               | Hosting platform           |

---

## 🗺️ Roadmap

* [x] Core slicing gameplay
* [x] Wallet connection
* [x] NFT reward minting
* [x] Leaderboard integration
* [ ] Multiplayer slicing battles
* [ ] NFT marketplace
* [ ] Seasonal events & rewards
* [ ] Mainnet deployment after Deploython

---

## 📊 Stats

**Smart Contract Address:** `Coming soon`
**Network:** Push Chain Testnet


---

<div align="center">

**Built for fun. Powered by Push.**
🚀 *Hypercasual gaming meets Web3 ownership.*

</div>
```
