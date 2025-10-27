const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || 
    require('../deployment-info.json').contractAddress;

  console.log("🎮 Minting Test NFT...");
  console.log("Contract:", contractAddress);
  console.log("");

  const contract = await hre.ethers.getContractAt(
    "PushNinjaGameNFT",
    contractAddress
  );

  const [signer] = await hre.ethers.getSigners();
  
  // Check if can mint
  const canMint = await contract.canMint(signer.address);
  if (!canMint) {
    const timeUntil = await contract.timeUntilNextMint(signer.address);
    console.log("❌ Cannot mint yet!");
    console.log("Time remaining:", timeUntil.toString(), "seconds");
    const stats = await contract.getPlayerStats(signer.address);
    if (stats.nftCount >= 100) {
      console.log("Reason: Maximum NFTs reached (100)");
    } else {
      console.log("Reason: Cooldown period");
    }
    return;
  }

  // Mint parameters
  const testScore = 250; // Gold tier
  const finalLives = 2;
  const slashCount = 125;

  console.log("Minting to:", signer.address);
  console.log("Score:", testScore);
  console.log("Lives:", finalLives);
  console.log("Slashes:", slashCount);
  console.log("");

  // Mint
  const tx = await contract.mintGameNFT(
    signer.address,
    testScore,
    finalLives,
    slashCount
  );

  console.log("⏳ Transaction submitted:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  console.log("✅ NFT Minted Successfully!");
  console.log("");
  console.log("Transaction:", receipt.hash);
  console.log("Block:", receipt.blockNumber);
  console.log("Gas Used:", receipt.gasUsed.toString());
  
  // Get the token ID from the event
  const mintEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === 'GameNFTMinted'
  );
  
  if (mintEvent) {
    const tokenId = mintEvent.args.tokenId;
    console.log("Token ID:", tokenId.toString());
    console.log("Tier:", ["BRONZE", "SILVER", "GOLD", "DIAMOND", "LEGEND"][mintEvent.args.tier]);
  }
  
  console.log("");
  console.log("🔗 View on Explorer:");
  console.log(`https://donut.push.network/tx/${receipt.hash}`);
  console.log("");
  
  // Get updated stats
  const stats = await contract.getPlayerStats(signer.address);
  console.log("📊 Updated Stats:");
  console.log("Total Games:", stats.totalGamesPlayed.toString());
  console.log("High Score:", stats.highestScore.toString());
  console.log("Total NFTs:", stats.nftCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
