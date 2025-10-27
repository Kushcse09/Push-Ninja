// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title PushNinjaGameNFT
 * @dev Battle-tested NFT contract for Push Ninja game achievements
 * Features:
 * - Dynamic on-chain metadata generation
 * - Achievement tiers (Bronze, Silver, Gold, Diamond, Legend)
 * - Anti-spam protection with cooldown
 * - Leaderboard integration
 * - Pausable for emergency situations
 * - Burnable for players who want to reset
 * - Gas-optimized with efficient storage
 */
contract PushNinjaGameNFT is 
    ERC721, 
    ERC721Burnable, 
    Ownable, 
    ReentrancyGuard, 
    Pausable 
{
    using Strings for uint256;

    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    
    // Cooldown to prevent spam minting (5 minutes)
    uint256 public constant MINT_COOLDOWN = 5 minutes;
    
    // Maximum NFTs per address to prevent abuse
    uint256 public constant MAX_NFTS_PER_ADDRESS = 100;
    
    // Score thresholds for achievement tiers
    uint256 public constant BRONZE_THRESHOLD = 50;
    uint256 public constant SILVER_THRESHOLD = 100;
    uint256 public constant GOLD_THRESHOLD = 200;
    uint256 public constant DIAMOND_THRESHOLD = 500;
    uint256 public constant LEGEND_THRESHOLD = 1000;

    // ============ Enums ============
    
    enum AchievementTier {
        BRONZE,
        SILVER,
        GOLD,
        DIAMOND,
        LEGEND
    }

    // ============ Structs ============
    
    struct GameStats {
        uint256 score;
        uint256 finalLives;
        uint256 slashCount;
        uint256 timestamp;
        AchievementTier tier;
        address player;
    }

    struct PlayerStats {
        uint256 totalGamesPlayed;
        uint256 highestScore;
        uint256 totalSlashes;
        uint256 lastMintTime;
        uint256 nftCount;
    }

    // ============ Mappings ============
    
    mapping(uint256 => GameStats) public gameStats;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerTokens;
    
    // Leaderboard: top 100 scores
    mapping(uint256 => address) public leaderboard;
    mapping(uint256 => uint256) public leaderboardScores;
    uint256 public leaderboardSize;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;

    // ============ Events ============
    
    event GameNFTMinted(
        address indexed player,
        uint256 indexed tokenId,
        uint256 score,
        AchievementTier tier,
        uint256 timestamp
    );
    
    event NewHighScore(
        address indexed player,
        uint256 oldScore,
        uint256 newScore
    );
    
    event LeaderboardUpdated(
        address indexed player,
        uint256 score,
        uint256 position
    );

    // ============ Constructor ============
    
    constructor() ERC721("Push Ninja Game Achievement", "PNGAME") Ownable(msg.sender) {}

    // ============ Main Functions ============
    
    /**
     * @dev Mint a new game achievement NFT
     * @param to Address to mint the NFT to
     * @param score Final game score
     * @param finalLives Lives remaining at end of game
     * @param slashCount Total number of successful slashes
     * @return tokenId The ID of the newly minted token
     */
    function mintGameNFT(
        address to,
        uint256 score,
        uint256 finalLives,
        uint256 slashCount
    ) 
        public 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(score > 0, "Score must be greater than 0");
        
        PlayerStats storage stats = playerStats[to];
        
        // Anti-spam: Check cooldown
        require(
            block.timestamp >= stats.lastMintTime + MINT_COOLDOWN,
            "Cooldown period not elapsed"
        );
        
        // Anti-abuse: Check max NFTs per address
        require(
            stats.nftCount < MAX_NFTS_PER_ADDRESS,
            "Maximum NFTs per address reached"
        );

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Determine achievement tier based on score
        AchievementTier tier = _calculateTier(score);
        
        // Store game stats
        gameStats[tokenId] = GameStats({
            score: score,
            finalLives: finalLives,
            slashCount: slashCount,
            timestamp: block.timestamp,
            tier: tier,
            player: to
        });
        
        // Update player stats
        stats.totalGamesPlayed++;
        stats.totalSlashes += slashCount;
        stats.lastMintTime = block.timestamp;
        stats.nftCount++;
        
        // Track player tokens
        playerTokens[to].push(tokenId);
        
        // Check for new high score
        if (score > stats.highestScore) {
            uint256 oldScore = stats.highestScore;
            stats.highestScore = score;
            emit NewHighScore(to, oldScore, score);
            
            // Update leaderboard
            _updateLeaderboard(to, score);
        }
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        emit GameNFTMinted(to, tokenId, score, tier, block.timestamp);
        
        return tokenId;
    }

    // ============ View Functions ============
    
    /**
     * @dev Get all token IDs owned by an address
     */
    function getPlayerTokens(address player) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return playerTokens[player];
    }
    
    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) 
        public 
        view 
        returns (
            uint256 totalGamesPlayed,
            uint256 highestScore,
            uint256 totalSlashes,
            uint256 nftCount,
            uint256 lastMintTime
        ) 
    {
        PlayerStats memory stats = playerStats[player];
        return (
            stats.totalGamesPlayed,
            stats.highestScore,
            stats.totalSlashes,
            stats.nftCount,
            stats.lastMintTime
        );
    }
    
    /**
     * @dev Get game stats for a specific token
     */
    function getGameStats(uint256 tokenId) 
        public 
        view 
        returns (
            uint256 score,
            uint256 finalLives,
            uint256 slashCount,
            uint256 timestamp,
            AchievementTier tier,
            address player
        ) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        GameStats memory stats = gameStats[tokenId];
        return (
            stats.score,
            stats.finalLives,
            stats.slashCount,
            stats.timestamp,
            stats.tier,
            stats.player
        );
    }
    
    /**
     * @dev Get top N players from leaderboard
     */
    function getLeaderboard(uint256 count) 
        public 
        view 
        returns (address[] memory players, uint256[] memory scores) 
    {
        uint256 size = count > leaderboardSize ? leaderboardSize : count;
        players = new address[](size);
        scores = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            players[i] = leaderboard[i];
            scores[i] = leaderboardScores[i];
        }
        
        return (players, scores);
    }
    
    /**
     * @dev Check if player can mint (cooldown elapsed)
     */
    function canMint(address player) public view returns (bool) {
        PlayerStats memory stats = playerStats[player];
        
        if (stats.nftCount >= MAX_NFTS_PER_ADDRESS) {
            return false;
        }
        
        return block.timestamp >= stats.lastMintTime + MINT_COOLDOWN;
    }
    
    /**
     * @dev Get time remaining until player can mint again
     */
    function timeUntilNextMint(address player) public view returns (uint256) {
        PlayerStats memory stats = playerStats[player];
        uint256 nextMintTime = stats.lastMintTime + MINT_COOLDOWN;
        
        if (block.timestamp >= nextMintTime) {
            return 0;
        }
        
        return nextMintTime - block.timestamp;
    }

    /**
     * @dev Generate dynamic SVG metadata for the NFT
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        GameStats memory stats = gameStats[tokenId];
        
        string memory svg = _generateSVG(stats);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Push Ninja Achievement #',
                        tokenId.toString(),
                        '",',
                        '"description": "Push Ninja Game Achievement - ',
                        _getTierName(stats.tier),
                        ' Tier",',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '",',
                        '"attributes": [',
                        '{"trait_type": "Score", "value": ',
                        stats.score.toString(),
                        '},',
                        '{"trait_type": "Final Lives", "value": ',
                        stats.finalLives.toString(),
                        '},',
                        '{"trait_type": "Slash Count", "value": ',
                        stats.slashCount.toString(),
                        '},',
                        '{"trait_type": "Achievement Tier", "value": "',
                        _getTierName(stats.tier),
                        '"},',
                        '{"trait_type": "Timestamp", "value": ',
                        stats.timestamp.toString(),
                        '}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // ============ Internal Functions ============
    
    /**
     * @dev Calculate achievement tier based on score
     */
    function _calculateTier(uint256 score) internal pure returns (AchievementTier) {
        if (score >= LEGEND_THRESHOLD) return AchievementTier.LEGEND;
        if (score >= DIAMOND_THRESHOLD) return AchievementTier.DIAMOND;
        if (score >= GOLD_THRESHOLD) return AchievementTier.GOLD;
        if (score >= SILVER_THRESHOLD) return AchievementTier.SILVER;
        return AchievementTier.BRONZE;
    }
    
    /**
     * @dev Get tier name as string
     */
    function _getTierName(AchievementTier tier) internal pure returns (string memory) {
        if (tier == AchievementTier.LEGEND) return "LEGEND";
        if (tier == AchievementTier.DIAMOND) return "DIAMOND";
        if (tier == AchievementTier.GOLD) return "GOLD";
        if (tier == AchievementTier.SILVER) return "SILVER";
        return "BRONZE";
    }
    
    /**
     * @dev Get tier color for SVG
     */
    function _getTierColor(AchievementTier tier) internal pure returns (string memory) {
        if (tier == AchievementTier.LEGEND) return "#FF0000"; // Red (Push Chain)
        if (tier == AchievementTier.DIAMOND) return "#B9F2FF"; // Diamond Blue
        if (tier == AchievementTier.GOLD) return "#FFD700"; // Gold
        if (tier == AchievementTier.SILVER) return "#C0C0C0"; // Silver
        return "#CD7F32"; // Bronze
    }
    
    /**
     * @dev Update leaderboard with new score
     */
    function _updateLeaderboard(address player, uint256 score) internal {
        // Find insertion position
        uint256 position = leaderboardSize;
        
        for (uint256 i = 0; i < leaderboardSize; i++) {
            if (score > leaderboardScores[i]) {
                position = i;
                break;
            }
        }
        
        // If score doesn't make leaderboard and board is full, return
        if (position == leaderboardSize && leaderboardSize >= MAX_LEADERBOARD_SIZE) {
            return;
        }
        
        // Shift lower scores down
        if (leaderboardSize < MAX_LEADERBOARD_SIZE) {
            leaderboardSize++;
        }
        
        for (uint256 i = leaderboardSize - 1; i > position; i--) {
            leaderboard[i] = leaderboard[i - 1];
            leaderboardScores[i] = leaderboardScores[i - 1];
        }
        
        // Insert new score
        leaderboard[position] = player;
        leaderboardScores[position] = score;
        
        emit LeaderboardUpdated(player, score, position);
    }
    
    /**
     * @dev Generate SVG for the NFT
     */
    function _generateSVG(GameStats memory stats) internal pure returns (string memory) {
        string memory tierColor = _getTierColor(stats.tier);
        string memory tierName = _getTierName(stats.tier);
        
        return string(
            abi.encodePacked(
                '<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />',
                '</linearGradient>',
                '<linearGradient id="tier" x1="0%" y1="0%" x2="100%" y2="0%">',
                '<stop offset="0%" style="stop-color:',
                tierColor,
                ';stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:',
                tierColor,
                ';stop-opacity:0.6" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="500" height="500" fill="url(#bg)"/>',
                '<rect x="20" y="20" width="460" height="460" fill="none" stroke="url(#tier)" stroke-width="4" rx="20"/>',
                '<text x="250" y="100" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">PUSH NINJA</text>',
                '<text x="250" y="150" font-family="Arial, sans-serif" font-size="24" fill="',
                tierColor,
                '" text-anchor="middle">',
                tierName,
                ' ACHIEVEMENT</text>',
                '<text x="250" y="220" font-family="Arial, sans-serif" font-size="20" fill="#aaa" text-anchor="middle">SCORE</text>',
                '<text x="250" y="260" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="url(#tier)" text-anchor="middle">',
                stats.score.toString(),
                '</text>',
                '<text x="150" y="340" font-family="Arial, sans-serif" font-size="16" fill="#aaa" text-anchor="middle">SLASHES</text>',
                '<text x="150" y="370" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">',
                stats.slashCount.toString(),
                '</text>',
                '<text x="350" y="340" font-family="Arial, sans-serif" font-size="16" fill="#aaa" text-anchor="middle">LIVES</text>',
                '<text x="350" y="370" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">',
                stats.finalLives.toString(),
                '</text>',
                '<text x="250" y="450" font-family="monospace" font-size="12" fill="#666" text-anchor="middle">',
                _formatTimestamp(stats.timestamp),
                '</text>',
                '</svg>'
            )
        );
    }
    
    /**
     * @dev Format timestamp for display
     */
    function _formatTimestamp(uint256 timestamp) internal pure returns (string memory) {
        return string(abi.encodePacked("BLOCK: ", timestamp.toString()));
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Pause contract in case of emergency
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    // ============ Burn Override ============
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        
        // Update player stats when burning (to == address(0))
        if (to == address(0) && from != address(0)) {
            if (playerStats[from].nftCount > 0) {
                playerStats[from].nftCount--;
            }
        }
        
        return from;
    }
}
