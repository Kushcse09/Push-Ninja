import { useState, useEffect, useCallback } from 'react';
import pushChainGameService from '../services/pushChainService';

export const usePushChain = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (pushChainGameService.isWalletConnected()) {
      setWalletAddress(pushChainGameService.getWalletAddress());
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await pushChainGameService.connectWallet();
      
      if (result.success) {
        setWalletAddress(result.address);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to connect wallet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    pushChainGameService.disconnectWallet();
    setWalletAddress(null);
    setError(null);
    setMintedNFT(null);
  }, []);

  // Start game session
  const startGameSession = useCallback(() => {
    pushChainGameService.startGameSession();
  }, []);

  // Record a slash
  const recordSlash = useCallback((slashData) => {
    pushChainGameService.recordSlash(slashData);
  }, []);

  // Mint NFT with game results
  const mintGameNFT = useCallback(async (gameStats) => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsMinting(true);
    setError(null);

    try {
      const result = await pushChainGameService.mintGameNFT(gameStats);
      
      if (result.success) {
        setMintedNFT(result);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Failed to mint NFT';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress]);

  // Get game session data
  const getGameSession = useCallback(async (tokenId) => {
    try {
      return await pushChainGameService.getGameSession(tokenId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get user's NFT count
  const getUserNFTCount = useCallback(async (address) => {
    try {
      return await pushChainGameService.getUserNFTCount(address || walletAddress);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [walletAddress]);

  return {
    // State
    walletAddress,
    isConnecting,
    error,
    isMinting,
    mintedNFT,
    isConnected: !!walletAddress,
    
    // Actions
    connectWallet,
    disconnectWallet,
    startGameSession,
    recordSlash,
    mintGameNFT,
    getGameSession,
    getUserNFTCount,
  };
};
