import React, { useState } from 'react';

const ResultsScreen = ({ gameState, onStartGame, onShowStartScreen, pushChain }) => {
  const isNewBest = gameState.score > gameState.bestScore;
  const [mintingStatus, setMintingStatus] = useState(null); // null, 'minting', 'success', 'error'
  const [transactionHash, setTransactionHash] = useState(null);

  return (
    <div className="screen results-screen">
      <div className="results-container">
        {/* Simple Game Over Title */}
        <div className="game-over-title">
          <h1>Game Over</h1>
          {isNewBest && <div className="new-best-badge">New Best!</div>}
        </div>
        
        {/* Score Section */}
        <div className="score-section">
          <div className="final-score">
            <span className="score-label">Score</span>
            <span className="score-value">{gameState.score}</span>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat">
            <span className="stat-value">{gameState.citreaSlashed || 0}</span>
            <span className="stat-label">Tokens Slashed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{gameState.maxCombo || 0}</span>
            <span className="stat-label">Max Combo</span>
          </div>
          <div className="stat">
            <span className="stat-value">{gameState.bestScore || 0}</span>
            <span className="stat-label">Best Score</span>
          </div>
        </div>
        
        {/* NFT Minting Section */}
        {pushChain && pushChain.isConnected && (
          <div className="nft-minting-section">
            {mintingStatus === 'success' ? (
              <div className="mint-success">
                <div className="success-header">
                  <div className="success-icon">🎉</div>
                  <h3 className="success-title">NFT Minted Successfully!</h3>
                  <p className="success-subtitle">Your achievement is now on Push Chain blockchain</p>
                </div>
                
                <div className="nft-links">
                  {transactionHash && (
                    <a 
                      href={`https://donut.push.network/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nft-link transaction-link"
                    >
                      
                      <span className="link-text">View Transaction</span>
                      <span className="link-arrow">→</span>
                    </a>
                  )}
                  
                  <a 
                    href={`https://donut.push.network/address/${pushChain.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nft-link contract-link"
                  >
                    
                    <span className="link-text">View Your Wallet</span>
                    <span className="link-arrow">→</span>
                  </a>
                </div>

                <div className="nft-details">
                  <div className="nft-detail-row">
                    <span className="detail-label">Contract Address:</span>
                    <code className="detail-value">{process.env.REACT_APP_PUSHCHAIN_CONTRACT_ADDRESS}</code>
                  </div>
                  
                  <div className="nft-detail-row">
                    <span className="detail-label">Your Wallet:</span>
                    <code className="detail-value">{pushChain.walletAddress}</code>
                  </div>
                  
                  {transactionHash && (
                    <div className="nft-detail-row">
                      <span className="detail-label">Transaction:</span>
                      <code className="detail-value">{transactionHash}</code>
                    </div>
                  )}
                </div>

                <div className="nft-note">
                  <span className="note-icon">ℹ️</span>
                  <span className="note-text">
                    Your achievement NFT has been recorded on Push Chain testnet.
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="game-button mint-nft"
                onClick={async () => {
                  setMintingStatus('minting');
                  try {
                    const duration = gameState.gameEndTime ? 
                      Math.floor((gameState.gameEndTime - gameState.gameStartTime) / 1000) : 0;
                    
                    const result = await pushChain.mintGameNFT({
                      score: gameState.score,
                      maxCombo: gameState.maxCombo || 0,
                      tokensSlashed: gameState.citreaSlashed || 0,
                      bombsHit: gameState.bombsHit || 0,
                      duration: duration
                    });
                    
                    if (result.success && result.transactionHash) {
                      setTransactionHash(result.transactionHash);
                    }
                    
                    setMintingStatus('success');
                  } catch (error) {
                    console.error('Failed to mint NFT:', error);
                    setMintingStatus('error');
                    setTimeout(() => setMintingStatus(null), 3000);
                  }
                }}
                disabled={mintingStatus === 'minting'}
              >
                {mintingStatus === 'minting' ? (
                  <>
                    <span className="spinner"></span>
                    Minting NFT...
                  </>
                ) : mintingStatus === 'error' ? (
                  '❌ Mint Failed - Try Again'
                ) : (
                  ' Mint Game NFT'
                )}
              </button>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="button-row">
          <button 
            className="game-button play-again" 
            onClick={onStartGame}
          >
            🔄 Replay
          </button>
          <button 
            className="game-button back-home" 
            onClick={onShowStartScreen}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;