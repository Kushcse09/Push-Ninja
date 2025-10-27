const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of PushNinjaGameNFT...\n");

  // Get the contract factory
  const PushNinjaGameNFT = await hre.ethers.getContractFactory("PushNinjaGameNFT");
  
  console.log("📝 Deploying contract...");
  const contract = await PushNinjaGameNFT.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deployerAddress = (await hre.ethers.getSigners())[0].address;
  
  console.log("✅ Contract deployed successfully!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("🎮 PUSH NINJA GAME NFT CONTRACT");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📍 Contract Address:", address);
  console.log("👤 Owner Address:", deployerAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Explorer:", `https://donut.push.network/address/${address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ 5 confirmations received\n");

  // Display contract information
  console.log("📊 Contract Information:");
  console.log("- Name:", await contract.name());
  console.log("- Symbol:", await contract.symbol());
  console.log("- Mint Cooldown:", (await contract.MINT_COOLDOWN()).toString(), "seconds (5 minutes)");
  console.log("- Max NFTs per Address:", (await contract.MAX_NFTS_PER_ADDRESS()).toString());
  console.log("- Achievement Tiers:");
  console.log("  • Bronze: 50+ points");
  console.log("  • Silver: 100+ points");
  console.log("  • Gold: 200+ points");
  console.log("  • Diamond: 500+ points");
  console.log("  • Legend: 1000+ points\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("📝 NEXT STEPS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("1. Update your .env file with:");
  console.log(`   REACT_APP_PUSHCHAIN_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Restart your development server:");
  console.log("   npm start");
  console.log("\n3. Test the integration:");
  console.log("   - Connect wallet");
  console.log("   - Play a game");
  console.log("   - Mint your achievement NFT!");
  console.log("\n4. View your NFT on the explorer:");
  console.log(`   https://donut.push.network/address/${address}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    ownerAddress: deployerAddress,
    deploymentTime: new Date().toISOString(),
    explorerUrl: `https://donut.push.network/address/${address}`,
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json\n");

  // Verify contract (if on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Waiting before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      console.log("Verifying contract on block explorer...");
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️  Verification failed (this is normal on some networks):", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
