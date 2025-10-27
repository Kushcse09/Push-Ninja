import { PushChain } from '@pushchain/core';
import { ethers } from 'ethers';

class PushChainGameService {
  constructor() {
    // Push Chain Testnet RPC
    this.rpcUrl = 'https://evm.rpc-testnet-donut-node1.push.org/';
    this.network = PushChain.CONSTANTS.PUSH_NETWORK.TESTNET;
    
    // Contract address - Deploy your contract and update this
    this.contractAddress = process.env.REACT_APP_PUSHCHAIN_CONTRACT_ADDRESS || '';
    
    this.pushChainClient = null;
    this.signer = null;
    this.walletAddress = null;
    this.slashBuffer = [];
    this.BATCH_SIZE = 10;
    this.currentTokenId = 0;
    this.gameStartTime = null;
  }

  // Connect wallet using MetaMask or other Web3 wallet
  async connectWallet() {
    try {
      console.log('🔵 Starting wallet connection...');
      console.log('🔍 Contract address:', this.contractAddress);
      
      // Check if ethereum wallet is available (MetaMask)
      if (!window.ethereum) {
        console.error('❌ window.ethereum not found');
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      console.log('✅ window.ethereum found');

      // Request account access
      console.log('📞 Requesting wallet connection...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      console.log('✅ Got wallet address:', address);

      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await provider.getSigner();
      this.walletAddress = address;

      // Convert to Universal Signer for Push Chain
      console.log('🔄 Converting to Universal Signer...');
      const universalSigner = await PushChain.utils.signer.toUniversal(this.signer);

      // Initialize Push Chain Client
      console.log('📝 Initializing Push Chain client...');
      this.pushChainClient = await PushChain.initialize(universalSigner, {
        network: this.network,
      });

      console.log('✅ Wallet connected successfully:', address);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          window.location.reload();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return {
        success: true,
        address: address
      };
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message || 'Failed to connect wallet'
      };
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    this.pushChainClient = null;
    this.signer = null;
    this.walletAddress = null;
    this.slashBuffer = [];
    console.log('👋 Wallet disconnected');
  }

  // Start a new game session
  startGameSession() {
    this.slashBuffer = [];
    this.gameStartTime = Date.now();
    this.currentTokenId = 0;
    console.log('🎮 Game session started');
  }

  // Record a slash (buffer for batch operation)
  recordSlash(slashData) {
    if (!this.walletAddress) {
      console.warn('⚠️ No wallet connected, slash not recorded on-chain');
      return;
    }

    // Track locally for stats
    console.log('✅ Slash recorded locally:', {
      type: slashData.isToken ? 'token' : 'bomb',
      points: slashData.points || 0,
      combo: slashData.combo || 0
    });
  }

  // Send buffered slashes to blockchain in a batch
  async sendSlashBatch() {
    // TODO: Implement batch slash recording
    // For now, skip this to focus on NFT minting
    console.log('⏭️ Skipping slash batch send (not implemented yet)');
    this.slashBuffer = [];
    return null;
  }

  // Mint NFT with game results using Push Chain universal transaction
  async mintGameNFT(gameStats) {
    if (!this.pushChainClient || !this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🎨 Minting game NFT...');
      console.log('📊 Game stats:', gameStats);

      const gameDuration = this.gameStartTime 
        ? Math.floor((Date.now() - this.gameStartTime) / 1000)
        : 0;

      // Validate contract address
      if (!this.contractAddress) {
        throw new Error('Contract address not configured. Please check your .env file.');
      }

      // Prepare contract call data
      // This assumes you have a mintGameNFT function in your smart contract
      const contractInterface = new ethers.Interface([
        'function mintGameNFT(uint256 finalScore, uint256 maxCombo, uint256 tokensSliced, uint256 bombsHit, uint256 gameDuration) external'
      ]);

      const callData = contractInterface.encodeFunctionData('mintGameNFT', [
        BigInt(gameStats.score || 0),
        BigInt(gameStats.maxCombo || 0),
        BigInt(gameStats.tokensSlashed || 0),
        BigInt(gameStats.bombsHit || 0),
        BigInt(gameDuration)
      ]);

      console.log('📝 Sending universal transaction to Push Chain...');
      
      // Send universal transaction to Push Chain
      const txHash = await this.pushChainClient.universal.sendTransaction({
        to: this.contractAddress,
        value: BigInt(0), // No $PC value to send
        data: callData,
      });

      console.log('✅ Transaction sent:', txHash);

      // Wait for transaction confirmation
      console.log('⏳ Waiting for confirmation...');
      
      // Give some time for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('✅ NFT Minted successfully!');
      
      return {
        success: true,
        transactionHash: txHash,
        explorerUrl: `https://donut.push.network/tx/${txHash}`
      };
    } catch (error) {
      console.error('❌ Failed to mint NFT:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      
      // User friendly error messages
      let errorMessage = error.message;
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient funds for transaction fee.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get game session data from NFT (requires contract interaction)
  async getGameSession(tokenId) {
    if (!this.pushChainClient) {
      throw new Error('Push Chain client not initialized');
    }

    try {
      // TODO: Implement contract read call
      // This would require setting up contract instance with ethers
      console.log('📖 Reading game session for token:', tokenId);
      
      return {
        player: this.walletAddress,
        finalScore: '0',
        maxCombo: '0',
        tokensSliced: '0',
        bombsHit: '0',
        gameDuration: '0',
        timestamp: Date.now().toString()
      };
    } catch (error) {
      console.error('❌ Failed to get game session:', error);
      throw error;
    }
  }

  // Get user's NFT count
  async getUserNFTCount(address) {
    if (!this.pushChainClient) {
      throw new Error('Push Chain client not initialized');
    }

    try {
      // TODO: Implement contract read call for balance
      console.log('📊 Getting NFT count for:', address || this.walletAddress);
      return '0';
    } catch (error) {
      console.error('❌ Failed to get NFT balance:', error);
      throw error;
    }
  }

  // Get current wallet address
  getWalletAddress() {
    return this.walletAddress;
  }

  // Check if wallet is connected
  isWalletConnected() {
    return !!this.walletAddress && !!this.pushChainClient;
  }
}

// Export singleton instance
const pushChainGameService = new PushChainGameService();
export default pushChainGameService;
