const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying PushNinjaGameNFT...\n");

  const PushNinjaGameNFT = await hre.ethers.getContractFactory("PushNinjaGameNFT");
  const contract = await PushNinjaGameNFT.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  
  console.log("✅ Contract deployed at:", address);
  console.log("🔗 Explorer:", `https://donut.push.network/address/${address}`);
  
  // Save to file
  const info = {
    contractAddress: address,
    network: "pushchain-testnet",
    deploymentTime: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(info, null, 2));
  fs.writeFileSync('.env.contract', `REACT_APP_PUSHCHAIN_CONTRACT_ADDRESS=${address}\n`);
  
  console.log("\n✅ Deployment info saved!");
  console.log("\n📝 Add this to your .env file:");
  console.log(`REACT_APP_PUSHCHAIN_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
