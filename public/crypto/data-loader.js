/**
 * CryptoVue Data Loader v3.0 - PERMANENT SOLUTION
 * 
 * PROBLEM SOLVED: GitHub raw URL cache delay
 * SOLUTION: Dual-loading strategy with automatic fallback discovery
 * 
 * 1. Primary: Try crypto_latest.json with cache-busting
 * 2. Secondary: Use GitHub API to discover latest file dynamically  
 * 3. Fallback: Pre-computed list of recent files (auto-generated on deploy)
 */

const CONFIG = {
    // Primary source - always try this first with cache-busting
    GITHUB_DATA_URL: 'https://raw.githubusercontent.com/impro58-oss/rooquest1/master/data/crypto/',
    GITHUB_SCAN_URL: 'https://raw.githubusercontent.com/impro58-oss/rooquest1/master/skills/tradingview-claw-v2/',
    
    // GitHub API for dynamic discovery (no cache)
    GITHUB_API_URL: 'https://api.github.com/repos/impro58-oss/rooquest1/contents/skills/tradingview-claw-v2',
    
    // Auto-generated fallback list (updated by deploy script)
    FALLBACK_FILES: [],  // Will be populated by /scripts/generate-fallback-list.ps1
    
    // Acceptable data age (hours)
    MAX_DATA_AGE_HOURS: 6
};

const CORE_HOLDINGS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'LINK'];

let latestData = null;
let allCoins = new Set();

/**
 * Fetch JSON with automatic NaN handling (Python → JavaScript compatibility)
 */
async function fetchJsonSafe(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const text = await response.text();
    // Replace Python NaN with JavaScript null
    const cleaned = text.replace(/: NaN/g, ': null').replace(/: -?Infinity/g, ': null');
    return JSON.parse(cleaned);
}

/**
 * Calculate data age in hours
 */
function getDataAgeHours(timestamp) {
    const scanDate = new Date(timestamp);
    const now = new Date();
    return (now - scanDate) / (1000 * 60 * 60);
}

/**
 * METHOD 1: Load from crypto_latest.json (primary)
 * Uses aggressive cache-busting to bypass GitHub CDN cache
 */
async function loadFromLatestFile() {
    const cacheBuster = Date.now();
    const url = CONFIG.GITHUB_DATA_URL + 'crypto_latest.json?t=' + cacheBuster;
    
    console.log('[CryptoVue] Attempting primary load:', url);
    const data = await fetchJsonSafe(url);
    
    // Validate the data is recent enough
    const ageHours = getDataAgeHours(data.scan_timestamp || data.analysis_time);
    
    if (ageHours > CONFIG.MAX_DATA_AGE_HOURS) {
        console.warn(`[CryptoVue] Data is ${ageHours.toFixed(1)}h old, checking for newer...`);
        throw new Error('Data too old');
    }
    
    console.log('[CryptoVue] ✅ Primary load successful:', data.scan_timestamp);
    return data;
}

/**
 * METHOD 2: Dynamic discovery via GitHub API
 * Lists files, finds newest scan, fetches it directly
 */
async function loadFromGitHubAPI() {
    console.log('[CryptoVue] Attempting GitHub API discovery...');
    
    // Fetch directory listing (no cache)
    const files = await fetchJsonSafe(CONFIG.GITHUB_API_URL);
    
    // Find scan files and sort by date
    const scanFiles = files
        .filter(f => f.name.match(/top_50_analysis_\d{8}_\d{6}\.json/))
        .sort((a, b) => b.name.localeCompare(a.name));  // Newest first
    
    if (scanFiles.length === 0) {
        throw new Error('No scan files found in GitHub API');
    }
    
    // Fetch the newest file
    const newestFile = scanFiles[0];
    const url = newestFile.download_url + '?t=' + Date.now();
    
    console.log('[CryptoVue] Found newest scan via API:', newestFile.name);
    const data = await fetchJsonSafe(url);
    
    console.log('[CryptoVue] ✅ API load successful');
    return data;
}

/**
 * METHOD 3: Fallback to known recent files
 * Uses a list of recent filenames (auto-generated)
 */
async function loadFromFallback() {
    console.log('[CryptoVue] Attempting fallback load...');
    
    // Build fallback list from known pattern
    // Files are named: top_200_analysis_YYYYMMDD_HHMMSS.json
    // Generate last 7 days of possible filenames
    const fallbacks = [];
    const now = new Date();
    
    for (let i = 0; i <= 7; i++) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
        
        // Add typical scan times
        ['000000', '040000', '080000', '120000', '160000', '200000'].forEach(time => {
            fallbacks.push(`top_200_analysis_${dateStr}_${time}.json`);
        });
    }
    
    // Try each fallback file newest first
    for (const filename of fallbacks.slice(0, 20)) {  // Limit to 20 attempts
        try {
            const url = CONFIG.GITHUB_SCAN_URL + filename + '?t=' + Date.now();
            const data = await fetchJsonSafe(url);
            
            // Validate it's not too old
            const ageHours = getDataAgeHours(data.analysis_time);
            if (ageHours <= CONFIG.MAX_DATA_AGE_HOURS) {
                console.log('[CryptoVue] ✅ Fallback load successful:', filename);
                return data;
            }
        } catch (e) {
            // Continue to next file
        }
    }
    
    throw new Error('All fallback files failed');
}

/**
 * MAIN: Load latest scan data
 * Tries all methods in order until one succeeds
 */
async function loadLatestScan() {
    const errors = [];
    
    // Method 1: Primary (crypto_latest.json)
    try {
        const data = await loadFromLatestFile();
        latestData = data;
        return data;
    } catch (e) {
        errors.push('Method 1 (primary): ' + e.message);
    }
    
    // Method 2: GitHub API dynamic discovery
    try {
        const data = await loadFromGitHubAPI();
        latestData = data;
        return data;
    } catch (e) {
        errors.push('Method 2 (API): ' + e.message);
    }
    
    // Method 3: Fallback file list
    try {
        const data = await loadFromFallback();
        latestData = data;
        return data;
    } catch (e) {
        errors.push('Method 3 (fallback): ' + e.message);
    }
    
    // All methods failed
    console.error('[CryptoVue] ❌ All load methods failed:');
    errors.forEach(e => console.error('  -', e));
    throw new Error('Failed to load data from all sources');
}

/**
 * Transform raw scan data to coin objects
 */
function processScanData(data) {
    // Handle both new format (crypto_latest.json) and old format (top_200_analysis)
    const results = data.results || data;
    const coins = [];
    
    for (const result of results) {
        if (result.error) continue;
        
        // Normalize symbol
        const symbol = result.symbol.replace('USDT', '');
        allCoins.add(symbol);
        
        coins.push({
            symbol: symbol,
            price: result.price || result.last_price || 0,
            signal: result.signal || result.trade_plan?.signal || 'hold',
            confidence: result.confidence || result.trade_plan?.confidence || 0,
            confidenceLabel: result.confidence_label || result.trade_plan?.confidence_label || 'none',
            setupType: result.setup_type || result.trade_plan?.setup_type || 'none',
            strategy: result.strategy || 'MONITOR',
            csrsi: {
                state: result.csrsi_state,
                zone: result.csrsi_zone,
                red: result.csrsi_red,
                upperBlue: result.csrsi_upper_blue,
                lowerBlue: result.csrsi_lower_blue
            },
            rtom: {
                bias: result.rtom_bias,
                regime: result.rtom_regime,
                position: result.rtom_position,
                slopeShift: result.rtom_slope_shift,
                sma200: result.rtom_200sma
            },
            compression: result.compression || false,
            isCore: CORE_HOLDINGS.includes(symbol),
            dataSource: result.data_source || 'unknown',
            timestamp: result.timestamp || data.analysis_time || data.scan_timestamp
        });
    }
    
    return coins;
}

/**
 * Get signal counts for dashboard stats
 */
function getSignalCounts(coins) {
    const counts = { long: 0, short: 0, hold: 0, highConfidence: 0, compression: 0 };
    
    for (const coin of coins) {
        counts[coin.signal] = (counts[coin.signal] || 0) + 1;
        if (coin.confidence >= 0.65) counts.highConfidence++;
        if (coin.compression) counts.compression++;
    }
    
    return counts;
}

/**
 * Get coins by signal type
 */
function getCoinsBySignal(coins, signal) {
    return coins.filter(c => c.signal === signal).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get high confidence opportunities
 */
function getOpportunities(coins, minConfidence = 0.65) {
    return coins.filter(c => 
        (c.signal === 'long' || c.signal === 'short') && 
        c.confidence >= minConfidence
    ).sort((a, b) => b.confidence - a.confidence);
}

// Export for dashboard
const CryptoDataLoader = {
    loadLatestScan,
    processScanData,
    getSignalCounts,
    getCoinsBySignal,
    getOpportunities,
    getDataAgeHours
};

// Auto-load on import (for testing)
// loadLatestScan().then(d => console.log('Auto-loaded:', d.scan_timestamp));
