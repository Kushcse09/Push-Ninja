const hre = require("hardhat");

async function main() {
  // Get contract address from command line or deployment-info.json
  const contractAddress = process.env.CONTRACT_ADDRESS || 
    require('../deployment-info.json').contractAddress;

  console.log("🔍 Interacting with contract at:", contractAddress);
  console.log("");

  // Get contract instance
  const contract = await hre.ethers.getContractAt(
    "PushNinjaGameNFT",
    contractAddress
  );

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Using account:", signer.address);
  console.log("");

  // Display contract info
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 CONTRACT INFORMATION");
  console.log("═══════════════════════════════════════════════════════");
  
  const name = await contract.name();
  const symbol = await contract.symbol();
  const owner = await contract.owner();
  const paused = await contract.paused();
  
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Owner:", owner);
  console.log("Paused:", paused);
  console.log("");

  // Display constants
  console.log("⚙️  CONFIGURATION");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Mint Cooldown:", (await contract.MINT_COOLDOWN()).toString(), "seconds");
  console.log("Max NFTs per Address:", (await contract.MAX_NFTS_PER_ADDRESS()).toString());
  console.log("");
  console.log("Achievement Thresholds:");
  console.log("  • Bronze:", (await contract.BRONZE_THRESHOLD()).toString(), "points");
  console.log("  • Silver:", (await contract.SILVER_THRESHOLD()).toString(), "points");
  console.log("  • Gold:", (await contract.GOLD_THRESHOLD()).toString(), "points");
  console.log("  • Diamond:", (await contract.DIAMOND_THRESHOLD()).toString(), "points");
  console.log("  • Legend:", (await contract.LEGEND_THRESHOLD()).toString(), "points");
  console.log("");

  // Check if signer can mint
  const canMint = await contract.canMint(signer.address);
  const timeUntilMint = await contract.timeUntilNextMint(signer.address);
  
  console.log("🎮 YOUR PLAYER STATUS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Can Mint:", canMint);
  if (!canMint && timeUntilMint > 0) {
    console.log("Time Until Next Mint:", timeUntilMint.toString(), "seconds");
  }
  console.log("");

  // Get player stats
  const stats = await contract.getPlayerStats(signer.address);
  console.log("📈 YOUR STATISTICS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Total Games Played:", stats.totalGamesPlayed.toString());
  console.log("Highest Score:", stats.highestScore.toString());
  console.log("Total Slashes:", stats.totalSlashes.toString());
  console.log("NFTs Owned:", stats.nftCount.toString());
  console.log("");

  // Get player's NFTs
  const playerTokens = await contract.getPlayerTokens(signer.address);
  if (playerTokens.length > 0) {
    console.log("🖼️  YOUR NFTs");
    console.log("═══════════════════════════════════════════════════════");
    for (const tokenId of playerTokens) {
      const gameStats = await contract.getGameStats(tokenId);
      const tierNames = ["BRONZE", "SILVER", "GOLD", "DIAMOND", "LEGEND"];
      console.log(`NFT #${tokenId}:`);
      console.log(`  Score: ${gameStats.score}`);
      console.log(`  Lives: ${gameStats.finalLives}`);
      console.log(`  Slashes: ${gameStats.slashCount}`);
      console.log(`  Tier: ${tierNames[gameStats.tier]}`);
      console.log(`  Date: ${new Date(Number(gameStats.timestamp) * 1000).toLocaleString()}`);
      console.log("");
    }
  }

  // Get leaderboard
  const leaderboardSize = await contract.leaderboardSize();
  if (leaderboardSize > 0) {
    console.log("🏆 LEADERBOARD (Top 10)");
    console.log("═══════════════════════════════════════════════════════");
    const count = leaderboardSize > 10 ? 10 : leaderboardSize;
    const [players, scores] = await contract.getLeaderboard(count);
    
    for (let i = 0; i < players.length; i++) {
      const position = i + 1;
      const emoji = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "  ";
      const isYou = players[i].toLowerCase() === signer.address.toLowerCase();
      const suffix = isYou ? " (YOU!)" : "";
      console.log(`${emoji} #${position}: ${players[i]} - ${scores[i]} points${suffix}`);
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("💡 EXAMPLE COMMANDS:");
  console.log("");
  console.log("Mint a test NFT:");
  console.log(`  npx hardhat run scripts/mint-test.js --network pushchain`);
  console.log("");
  console.log("Pause contract (owner only):");
  console.log(`  npx hardhat run scripts/pause.js --network pushchain`);
  console.log("");
  console.log("View this info again:");
  console.log(`  npx hardhat run scripts/interact.js --network pushchain`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
