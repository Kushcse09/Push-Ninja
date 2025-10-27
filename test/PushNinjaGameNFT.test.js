const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PushNinjaGameNFT", function () {
  let contract;
  let owner;
  let player1;
  let player2;
  let player3;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    const PushNinjaGameNFT = await ethers.getContractFactory("PushNinjaGameNFT");
    contract = await PushNinjaGameNFT.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal("Push Ninja Game Achievement");
      expect(await contract.symbol()).to.equal("PNGAME");
    });

    it("Should set the deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await contract.MINT_COOLDOWN()).to.equal(300); // 5 minutes
      expect(await contract.MAX_NFTS_PER_ADDRESS()).to.equal(100);
      expect(await contract.BRONZE_THRESHOLD()).to.equal(50);
      expect(await contract.SILVER_THRESHOLD()).to.equal(100);
      expect(await contract.GOLD_THRESHOLD()).to.equal(200);
      expect(await contract.DIAMOND_THRESHOLD()).to.equal(500);
      expect(await contract.LEGEND_THRESHOLD()).to.equal(1000);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT with correct stats", async function () {
      const score = 150;
      const lives = 2;
      const slashes = 75;

      await contract.mintGameNFT(player1.address, score, lives, slashes);

      const stats = await contract.getGameStats(0);
      expect(stats.score).to.equal(score);
      expect(stats.finalLives).to.equal(lives);
      expect(stats.slashCount).to.equal(slashes);
      expect(stats.player).to.equal(player1.address);
      expect(stats.tier).to.equal(2); // GOLD tier (200+ points)
    });

    it("Should update player stats correctly", async function () {
      await contract.mintGameNFT(player1.address, 100, 3, 50);

      const playerStats = await contract.getPlayerStats(player1.address);
      expect(playerStats.totalGamesPlayed).to.equal(1);
      expect(playerStats.highestScore).to.equal(100);
      expect(playerStats.totalSlashes).to.equal(50);
      expect(playerStats.nftCount).to.equal(1);
    });

    it("Should assign correct achievement tiers", async function () {
      // Bronze
      await contract.mintGameNFT(player1.address, 50, 1, 25);
      let stats = await contract.getGameStats(0);
      expect(stats.tier).to.equal(0); // BRONZE

      // Silver
      await time.increase(301); // Wait cooldown
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      stats = await contract.getGameStats(1);
      expect(stats.tier).to.equal(1); // SILVER

      // Gold
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 200, 2, 100);
      stats = await contract.getGameStats(2);
      expect(stats.tier).to.equal(2); // GOLD

      // Diamond
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 500, 3, 250);
      stats = await contract.getGameStats(3);
      expect(stats.tier).to.equal(3); // DIAMOND

      // Legend
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 1000, 3, 500);
      stats = await contract.getGameStats(4);
      expect(stats.tier).to.equal(4); // LEGEND
    });

    it("Should track player tokens", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 150, 2, 75);

      const tokens = await contract.getPlayerTokens(player1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(0);
      expect(tokens[1]).to.equal(1);
    });

    it("Should emit GameNFTMinted event", async function () {
      await expect(contract.mintGameNFT(player1.address, 100, 2, 50))
        .to.emit(contract, "GameNFTMinted")
        .withArgs(player1.address, 0, 100, 1, await time.latest() + 1);
    });

    it("Should revert if score is 0", async function () {
      await expect(
        contract.mintGameNFT(player1.address, 0, 2, 50)
      ).to.be.revertedWith("Score must be greater than 0");
    });

    it("Should revert if minting to zero address", async function () {
      await expect(
        contract.mintGameNFT(ethers.ZeroAddress, 100, 2, 50)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should revert if non-owner tries to mint", async function () {
      await expect(
        contract.connect(player1).mintGameNFT(player2.address, 100, 2, 50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Cooldown", function () {
    it("Should enforce cooldown period", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);

      await expect(
        contract.mintGameNFT(player1.address, 150, 2, 75)
      ).to.be.revertedWith("Cooldown period not elapsed");
    });

    it("Should allow minting after cooldown", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      
      await time.increase(301); // Increase time by 5+ minutes
      
      await expect(
        contract.mintGameNFT(player1.address, 150, 2, 75)
      ).to.not.be.reverted;
    });

    it("Should return correct canMint status", async function () {
      expect(await contract.canMint(player1.address)).to.equal(true);
      
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      expect(await contract.canMint(player1.address)).to.equal(false);
      
      await time.increase(301);
      expect(await contract.canMint(player1.address)).to.equal(true);
    });

    it("Should return correct time until next mint", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      
      const timeRemaining = await contract.timeUntilNextMint(player1.address);
      expect(timeRemaining).to.be.closeTo(300, 5);
      
      await time.increase(301);
      expect(await contract.timeUntilNextMint(player1.address)).to.equal(0);
    });
  });

  describe("Max NFTs per Address", function () {
    it("Should enforce max NFT limit", async function () {
      // Mint 100 NFTs (max)
      for (let i = 0; i < 100; i++) {
        await contract.mintGameNFT(player1.address, 100, 2, 50);
        await time.increase(301);
      }

      // Try to mint 101st NFT
      await expect(
        contract.mintGameNFT(player1.address, 100, 2, 50)
      ).to.be.revertedWith("Maximum NFTs per address reached");
    });

    it("Should return false for canMint when max reached", async function () {
      // Mint 100 NFTs
      for (let i = 0; i < 100; i++) {
        await contract.mintGameNFT(player1.address, 100, 2, 50);
        await time.increase(301);
      }

      expect(await contract.canMint(player1.address)).to.equal(false);
    });
  });

  describe("High Score Tracking", function () {
    it("Should update high score when beaten", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 200, 2, 100);

      const stats = await contract.getPlayerStats(player1.address);
      expect(stats.highestScore).to.equal(200);
    });

    it("Should not update high score with lower score", async function () {
      await contract.mintGameNFT(player1.address, 200, 2, 100);
      await time.increase(301);
      await contract.mintGameNFT(player1.address, 100, 2, 50);

      const stats = await contract.getPlayerStats(player1.address);
      expect(stats.highestScore).to.equal(200);
    });

    it("Should emit NewHighScore event", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      await time.increase(301);

      await expect(contract.mintGameNFT(player1.address, 200, 2, 100))
        .to.emit(contract, "NewHighScore")
        .withArgs(player1.address, 100, 200);
    });
  });

  describe("Leaderboard", function () {
    it("Should add players to leaderboard", async function () {
      await contract.mintGameNFT(player1.address, 500, 3, 250);
      await contract.mintGameNFT(player2.address, 300, 2, 150);
      await contract.mintGameNFT(player3.address, 700, 3, 350);

      const [players, scores] = await contract.getLeaderboard(3);
      
      expect(players[0]).to.equal(player3.address); // Highest score
      expect(scores[0]).to.equal(700);
      expect(players[1]).to.equal(player1.address);
      expect(scores[1]).to.equal(500);
      expect(players[2]).to.equal(player2.address);
      expect(scores[2]).to.equal(300);
    });

    it("Should maintain sorted leaderboard", async function () {
      const players = [player1, player2, player3];
      const testScores = [300, 500, 200];

      for (let i = 0; i < players.length; i++) {
        await contract.mintGameNFT(players[i].address, testScores[i], 2, 100);
      }

      const [addresses, scores] = await contract.getLeaderboard(3);
      
      // Should be sorted: 500, 300, 200
      expect(scores[0]).to.equal(500);
      expect(scores[1]).to.equal(300);
      expect(scores[2]).to.equal(200);
    });

    it("Should emit LeaderboardUpdated event", async function () {
      await expect(contract.mintGameNFT(player1.address, 500, 3, 250))
        .to.emit(contract, "LeaderboardUpdated");
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause", async function () {
      await contract.pause();
      expect(await contract.paused()).to.equal(true);

      await contract.unpause();
      expect(await contract.paused()).to.equal(false);
    });

    it("Should prevent minting when paused", async function () {
      await contract.pause();

      await expect(
        contract.mintGameNFT(player1.address, 100, 2, 50)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow minting when unpaused", async function () {
      await contract.pause();
      await contract.unpause();

      await expect(
        contract.mintGameNFT(player1.address, 100, 2, 50)
      ).to.not.be.reverted;
    });

    it("Should only allow owner to pause", async function () {
      await expect(
        contract.connect(player1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("Should allow burning NFTs", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      
      await contract.connect(player1).burn(0);
      
      await expect(contract.ownerOf(0)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Should update nftCount when burning", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      
      let stats = await contract.getPlayerStats(player1.address);
      expect(stats.nftCount).to.equal(1);
      
      await contract.connect(player1).burn(0);
      
      stats = await contract.getPlayerStats(player1.address);
      expect(stats.nftCount).to.equal(0);
    });
  });

  describe("Token URI", function () {
    it("Should generate token URI", async function () {
      await contract.mintGameNFT(player1.address, 150, 2, 75);
      
      const uri = await contract.tokenURI(0);
      expect(uri).to.include("data:application/json;base64,");
    });

    it("Should revert for non-existent token", async function () {
      await expect(contract.tokenURI(999)).to.be.revertedWith(
        "Token does not exist"
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple players minting simultaneously", async function () {
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      await contract.mintGameNFT(player2.address, 150, 2, 75);
      await contract.mintGameNFT(player3.address, 200, 3, 100);

      expect(await contract.balanceOf(player1.address)).to.equal(1);
      expect(await contract.balanceOf(player2.address)).to.equal(1);
      expect(await contract.balanceOf(player3.address)).to.equal(1);
    });

    it("Should handle exact threshold scores", async function () {
      await contract.mintGameNFT(player1.address, 50, 1, 25);
      let stats = await contract.getGameStats(0);
      expect(stats.tier).to.equal(0); // BRONZE

      await time.increase(301);
      await contract.mintGameNFT(player1.address, 100, 2, 50);
      stats = await contract.getGameStats(1);
      expect(stats.tier).to.equal(1); // SILVER

      await time.increase(301);
      await contract.mintGameNFT(player1.address, 1000, 3, 500);
      stats = await contract.getGameStats(2);
      expect(stats.tier).to.equal(4); // LEGEND
    });
  });
});
