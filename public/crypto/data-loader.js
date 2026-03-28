/**
 * CryptoVue Data Loader
 * Reads JSON scan files and populates the dashboard
 * DYNAMIC: Auto-discovers latest scan file
 */

// Configuration
const DATA_PATH = '../skills/tradingview-claw-v2/';
const CORE_HOLDINGS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'LINK'];
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/impro58-oss/rooquest1/master/skills/tradingview-claw-v2/';
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/impro58-oss/rooquest1/master/data/crypto/';

// State
let latestData = null;
let historicalData = [];
let allCoins = new Set();

/**
 * Extract timestamp from filename for sorting
 * Format: top_50_analysis_YYYYMMDD_HHMMSS.json
 */
function extractTimestamp(filename) {
    const match = filename.match(/(\d{8})_(\d{6})/);
    if (match) {
        return parseInt(match[1] + match[2]);
    }
    return 0;
}

/**
 * Load the most recent scan data - DYNAMIC DISCOVERY
 * Fetches from GitHub only (Vercel compatible)
 * Includes cache-busting to ensure fresh data (no headers to avoid CORS)
 */
async function loadLatestScan() {
    try {
        // Always use GitHub for Vercel deployment
        // Add cache-busting parameter only (headers trigger CORS preflight)
        const cacheBuster = Date.now();
        const latestJsonUrl = GITHUB_DATA_URL + 'crypto_latest.json?t=' + cacheBuster;
        
        console.log('Fetching:', latestJsonUrl);
        
        const response = await fetch(latestJsonUrl);
        
        if (response.ok) {
            const data = await response.json();
            latestData = data;
            console.log('✅ Loaded latest scan from GitHub:', data.scan_timestamp);
            console.log('Total symbols:', data.total_symbols);
            return data;
        } else {
            console.error('❌ crypto_latest.json fetch failed:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (e) {
        console.error('❌ Error fetching crypto_latest.json:', e.message);
    }
    
    // METHOD 2: Use GitHub API to list files dynamically
    try {
        console.log('Fetching file list from GitHub API...');
        const apiUrl = 'https://api.github.com/repos/impro58-oss/rooquest1/contents/skills/tradingview-claw-v2';
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Filter for scan files and extract timestamps
        const scanFiles = files
            .filter(f => f.name.match(/top_50_analysis_\d{8}_\d{6}\.json/))
            .map(f => ({
                name: f.name,
                timestamp: extractTimestamp(f.name),
                download_url: f.download_url
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // Newest first
        
        if (scanFiles.length === 0) {
            throw new Error('No scan files found via GitHub API');
        }
        
        // Try to load the newest file
        const newestFile = scanFiles[0];
        console.log('Found', scanFiles.length, 'scan files. Newest:', newestFile.name);
        
        const scanResponse = await fetch(newestFile.download_url + '?t=' + Date.now());
        if (scanResponse.ok) {
            const data = await scanResponse.json();
            latestData = data;
            console.log('Loaded scan from GitHub API:', newestFile.name);
            return data;
        }
        
    } catch (e) {
        console.error('GitHub API method failed:', e.message);
    }
    
    // METHOD 3: Fallback to hardcoded list (last resort)
    console.log('Trying fallback scan files...');
    return await loadFallbackScan();
}

/**
 * Fetch from GitHub only (for Vercel deployment)
 * Cache-busting only, no headers to avoid CORS preflight
 */
async function fetchWithFallback(localPath, githubUrl) {
    // Try GitHub first (always works on Vercel)
    try {
        const cacheBuster = Date.now();
        const response = await fetch(githubUrl + '?t=' + cacheBuster);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log('GitHub fetch failed:', githubUrl);
    }
    
    // Try local as fallback
    try {
        const response = await fetch(localPath);
        if (response.ok) {
            return await response.json();
        }
    } catch (e2) {
        throw new Error('Both GitHub and local fetch failed');
    }
    
    return null;
}

/**
 * Generate potential filenames for last 14 days
 * Pattern: top_50_analysis_YYYYMMDD_HHMMSS.json
 * Scan runs every 4 hours: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
 * Updated: 2026-03-24
 */
function generatePotentialFilenames() {
    const files = [];
    const now = new Date();
    
    // Generate files for last 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() - dayOffset);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // Standard scan times (every 4 hours)
        const hours = ['20', '16', '12', '08', '04', '00'];
        
        for (const hour of hours) {
            // Use 00 for minutes/seconds as base pattern
            files.push(`top_50_analysis_${dateStr}_${hour}0000.json`);
        }
    }
    
    return files;
}

/**
 * Fallback: Use curated list of recent known files
 * Updated: 2026-03-27 07:50 - includes latest March 27 scan
 */
async function loadFallbackScan() {
    const fallbackFiles = [
        'top_50_analysis_20260328_120213.json',  // LATEST: March 28, 12:02 PM
        'top_50_analysis_20260328_080155.json',  // March 28, 8:01 AM
        'top_50_analysis_20260328_040158.json',  // March 28, 4:01 AM
        'top_50_analysis_20260328_000210.json',  // March 28, 12:00 AM
        'top_50_analysis_20260327_200157.json',  // March 27, 8:01 PM
        'top_50_analysis_20260327_160203.json',  // March 27, 4:02 PM
        'top_50_analysis_20260327_120206.json',  // March 27, 12:02 PM
        'top_50_analysis_20260327_080201.json'   // March 27, 8:02 AM
    ];
    
    for (const filename of fallbackFiles) {
        try {
            const data = await fetchWithFallback(DATA_PATH + filename, GITHUB_RAW_URL + filename);
            if (data) {
                latestData = data;
                console.log('Loaded fallback scan:', filename);
                return data;
            }
        } catch (e) {
            continue;
        }
    }
    
    return null;
}

/**
 * Process scan data for display
 */
function processScanData(data) {
    if (!data || !data.results) return [];
    
    // Filter out coins with missing/null price
    const validResults = data.results.filter(coin => 
        coin.price !== null && 
        coin.price !== undefined && 
        !isNaN(coin.price)
    );
    
    console.log(`Processed ${validResults.length} of ${data.results.length} coins (filtered ${data.results.length - validResults.length} with missing price)`);
    
    return validResults.map(coin => ({
        symbol: coin.symbol.replace('USDT', ''),
        fullSymbol: coin.symbol,
        price: coin.price,
        signal: coin.signal,
        confidence: coin.confidence,
        confidenceLabel: coin.confidence_label,
        strategy: coin.strategy,
        setupType: coin.setup_type,
        csrsiState: coin.csrsi_state,
        csrsiZone: coin.csrsi_zone,
        csrsiRed: coin.csrsi_red,
        rtomBias: coin.rtom_bias,
        rtomRegime: coin.rtom_regime,
        rtomPosition: coin.rtom_position,
        compression: coin.compression,
        liquiditySweep: coin.liquidity_sweep,
        wickRejection: coin.wick_rejection,
        entryZone: coin.entry_zone,
        stopLoss: coin.stop_loss,
        tp1: coin.tp1,
        tp2: coin.tp2,
        dataSource: coin.data_source,
        timestamp: coin.timestamp
    }));
}

/**
 * Get signal counts
 */
function getSignalCounts(processedData) {
    return {
        long: processedData.filter(c => c.signal === 'long').length,
        short: processedData.filter(c => c.signal === 'short').length,
        hold: processedData.filter(c => c.signal === 'hold').length,
        futures: processedData.filter(c => c.strategy === 'FUTURES').length,
        compression: processedData.filter(c => c.compression).length,
        highConfidence: processedData.filter(c => c.confidence >= 65).length
    };
}

/**
 * Get top opportunities
 */
function getTopOpportunities(processedData, limit = 6) {
    return processedData
        .filter(c => c.strategy === 'FUTURES' || c.confidence >= 45)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);
}

/**
 * Get core holdings data
 */
function getCoreHoldingsData(processedData) {
    return processedData.filter(c => CORE_HOLDINGS.includes(c.symbol));
}

/**
 * Format price
 */
function formatPrice(price) {
    if (price === null || price === undefined) return '$0.00';
    if (price >= 1000) return '$' + price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (price >= 1) return '$' + price.toFixed(2);
    if (price >= 0.01) return '$' + price.toFixed(4);
    return '$' + price.toFixed(6);
}

/**
 * Get signal color
 */
function getSignalColor(signal) {
    switch(signal) {
        case 'long': return '#10B981';
        case 'short': return '#EF4444';
        case 'futures': return '#F59E0B';
        default: return '#6B7280';
    }
}

/**
 * Get signal class
 */
function getSignalClass(signal) {
    switch(signal) {
        case 'long': return 'signal-long';
        case 'short': return 'signal-short';
        case 'futures': return 'signal-futures';
        default: return 'signal-hold';
    }
}

/**
 * Get confidence class
 */
function getConfidenceClass(confidence) {
    if (confidence >= 65) return 'confidence-high';
    if (confidence >= 45) return 'confidence-medium';
    return 'confidence-low';
}

// Export for use in dashboard
window.CryptoDataLoader = {
    loadLatestScan,
    processScanData,
    getSignalCounts,
    getTopOpportunities,
    getCoreHoldingsData,
    formatPrice,
    getSignalColor,
    getSignalClass,
    getConfidenceClass,
    CORE_HOLDINGS
};
