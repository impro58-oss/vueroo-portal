/**
 * StockVue Data Loader v3.0 - PERMANENT SOLUTION
 * 
 * Three-tier loading strategy:
 * 1. Primary: stocks_latest.json with cache-busting
 * 2. Secondary: GitHub API dynamic file discovery
 * 3. Fallback: Predictable filename pattern matching
 */

const CONFIG = {
    GITHUB_DATA_URL: 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data/stocks/',
    GITHUB_API_URL: 'https://api.github.com/repos/impro58-oss/vueroo-data/contents/data/stocks',
    MAX_DATA_AGE_HOURS: 6
};

let latestData = null;

/**
 * Fetch JSON with error handling
 */
async function fetchJsonSafe(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/**
 * Calculate data age
 */
function getDataAgeHours(timestamp) {
    return (new Date() - new Date(timestamp)) / (1000 * 60 * 60);
}

/**
 * METHOD 1: Load from stocks_latest.json
 */
async function loadFromLatestFile() {
    const url = CONFIG.GITHUB_DATA_URL + 'stocks_latest.json?t=' + Date.now();
    console.log('[StockVue] Primary load:', url);
    
    const data = await fetchJsonSafe(url);
    const ageHours = getDataAgeHours(data.scan_timestamp);
    
    if (ageHours > CONFIG.MAX_DATA_AGE_HOURS) {
        throw new Error(`Data too old (${ageHours.toFixed(1)}h)`);
    }
    
    console.log('[StockVue] ✅ Primary load successful');
    return data;
}

/**
 * METHOD 2: GitHub API discovery
 */
async function loadFromGitHubAPI() {
    console.log('[StockVue] API discovery...');
    const files = await fetchJsonSafe(CONFIG.GITHUB_API_URL);
    
    const scanFiles = files
        .filter(f => f.name.match(/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}_\d{6}\.json/))
        .sort((a, b) => b.name.localeCompare(a.name));
    
    if (!scanFiles.length) throw new Error('No files found');
    
    const url = scanFiles[0].download_url + '?t=' + Date.now();
    console.log('[StockVue] Found:', scanFiles[0].name);
    return fetchJsonSafe(url);
}

/**
 * METHOD 3: Fallback pattern
 */
async function loadFromFallback() {
    console.log('[StockVue] Fallback pattern...');
    const patterns = [];
    
    for (let i = 0; i <= 7; i++) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().slice(0,7); // YYYY-MM
        const filePrefix = d.toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
        
        ['000000', '040000', '080000', '120000', '160000', '200000'].forEach(time => {
            patterns.push(`${dateStr}/${filePrefix}_${time}.json`);
        });
    }
    
    for (const pattern of patterns.slice(0, 20)) {
        try {
            const url = CONFIG.GITHUB_DATA_URL + pattern + '?t=' + Date.now();
            const data = await fetchJsonSafe(url);
            const age = getDataAgeHours(data.scan_timestamp);
            if (age <= CONFIG.MAX_DATA_AGE_HOURS) {
                console.log('[StockVue] ✅ Fallback successful:', pattern);
                return data;
            }
        } catch (e) { /* continue */ }
    }
    throw new Error('All fallbacks failed');
}

/**
 * MAIN: Load stock data with all three methods
 */
async function loadStockData() {
    const errors = [];
    
    try {
        latestData = await loadFromLatestFile();
        return latestData;
    } catch (e) { errors.push('Primary: ' + e.message); }
    
    try {
        latestData = await loadFromGitHubAPI();
        return latestData;
    } catch (e) { errors.push('API: ' + e.message); }
    
    try {
        latestData = await loadFromFallback();
        return latestData;
    } catch (e) { errors.push('Fallback: ' + e.message); }
    
    console.error('[StockVue] All methods failed:', errors);
    throw new Error('Failed to load stock data');
}

/**
 * Transform data for dashboard
 */
function processStockData(data) {
    return (data.results || []).map(r => ({
        symbol: r.symbol,
        price: r.price,
        change: r.change_percent,
        volume: r.volume,
        rsi: r.rsi,
        macd: r.macd,
        signal: r.signal,
        confidence: r.confidence,
        confidenceLabel: r.confidence_label,
        reasons: r.reasons || [],
        timestamp: r.timestamp
    }));
}

/**
 * Get signal counts
 */
function getSignalCounts(stocks) {
    return {
        long: stocks.filter(s => s.signal === 'long').length,
        short: stocks.filter(s => s.signal === 'short').length,
        highConf: stocks.filter(s => s.confidence >= 0.7).length
    };
}

// Export
const StockDataLoader = {
    loadStockData,
    processStockData,
    getSignalCounts
};

// Auto-load compatibility
if (typeof window !== 'undefined') {
    window.StockDataLoader = StockDataLoader;
}
