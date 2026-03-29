// Crucix Feed Loader — Fetches and displays 27-source intelligence data

async function loadCrucixData() {
    const url = '/data/crucix_feed.json';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        
        displayCrucixData(data);
        return data;
    } catch (error) {
        console.error('Crucix load error:', error);
        document.getElementById('crucix-container').innerHTML = 
            '<p class="text-gray-400">Crucix data unavailable</p>';
        return null;
    }
}

function displayCrucixData(data) {
    const container = document.getElementById('crucix-container');
    if (!container) return;
    
    const meta = data.metadata;
    const markets = data.markets;
    const alerts = data.alerts || [];
    
    // Format numbers
    const formatPrice = (p) => p ? '$' + p.toLocaleString() : '-';
    const formatChange = (c) => {
        if (!c) return '';
        const color = c > 0 ? 'text-green-500' : c < 0 ? 'text-red-500' : 'text-gray-500';
        const sign = c > 0 ? '+' : '';
        return `<span class="${color}">${sign}${c.toFixed(2)}%</span>`;
    };
    
    // Build HTML
    let html = `
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <h3 class="text-lg font-semibold text-white">Crucix Intelligence</h3>
                </div>
                <div class="text-xs text-slate-400">
                    ${meta.sources_active}/${meta.sources_total} sources
                </div>
            </div>
            
            <!-- Markets Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">BTC</div>
                    <div class="text-lg font-mono text-white">${formatPrice(markets.btc)}</div>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">ETH</div>
                    <div class="text-lg font-mono text-white">${formatPrice(markets.eth)}</div>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">VIX</div>
                    <div class="text-lg font-mono ${markets.vix > 25 ? 'text-red-400' : 'text-white'}">${markets.vix || '-'}</div>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">SPY</div>
                    <div class="text-lg font-mono text-white">${formatPrice(markets.spy)}</div>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">Gold</div>
                    <div class="text-lg font-mono text-white">${formatPrice(markets.gold)}</div>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-3">
                    <div class="text-xs text-slate-400 mb-1">WTI Oil</div>
                    <div class="text-lg font-mono text-white">${formatPrice(markets.wti)}</div>
                </div>
            </div>
            
            <!-- Alerts -->
            ${alerts.length > 0 ? `
            <div class="space-y-2">
                <div class="text-xs font-medium text-slate-400 uppercase tracking-wider">Security Alerts</div>
                ${alerts.map(alert => {
                    const severityColor = alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                    return `
                    <div class="flex items-start gap-2 p-2 rounded-lg border ${severityColor}">
                        <div class="text-xs font-bold uppercase">${alert.severity}</div>
                        <div class="text-sm flex-1">${alert.message}</div>
                    </div>
                    `;
                }).join('')}
            </div>
            ` : ''}
            
            <!-- Footer -->
            <div class="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <span>Last update: ${new Date(meta.last_update).toLocaleString()}</span>
                <a href="https://www.crucix.live/" target="_blank" rel="noopener" class="text-rose-400 hover:text-rose-300">
                    Open Crucix →
                </a>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Auto-load on page load
document.addEventListener('DOMContentLoaded', loadCrucixData);

// Refresh every 15 minutes
setInterval(loadCrucixData, 15 * 60 * 1000);

// Export for manual refresh
window.refreshCrucix = loadCrucixData;
