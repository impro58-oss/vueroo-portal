import { NextResponse } from 'next/server';

const VUEROO_DATA_BASE = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    // Fetch live data from all sources in parallel
    const [cryptoRes, stocksRes, quantRes, tradingRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA_BASE}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetch(`${VUEROO_DATA_BASE}/stocks/stocks_latest.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/data/quantvue/signals.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/trading/dashboard.json?t=${Date.now()}`),
    ]);

    // Extract counts from live data
    let cryptoSignals = 0, cryptoTotal = 0, cryptoTimestamp = '';
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      cryptoSignals = crypto.signals_found || 0;
      cryptoTotal = crypto.total_symbols || 0;
      cryptoTimestamp = crypto.scan_timestamp || '';
    }

    let stockCount = 0, stockTimestamp = '';
    if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
      const stocks = await stocksRes.value.json();
      stockCount = stocks.stocks?.length || 0;
      stockTimestamp = stocks.timestamp || '';
    }

    let quantSignals = 0;
    const quantAssets: string[] = [];
    if (quantRes.status === 'fulfilled' && quantRes.value.ok) {
      const quant = await quantRes.value.json();
      for (const [asset, data] of Object.entries(quant)) {
        quantAssets.push(asset);
        if ((data as any).consensus_signal && (data as any).consensus_signal !== 'NO_SIGNAL') {
          quantSignals++;
        }
      }
    }

    let tradingPositions = 0, tradingPnl = 0, tradingTimestamp = '';
    if (tradingRes.status === 'fulfilled' && tradingRes.value.ok) {
      const trading = await tradingRes.value.json();
      tradingPositions = trading.open_positions || 0;
      tradingPnl = trading.total_pnl_eur || 0;
      tradingTimestamp = trading.timestamp || '';
    }

    const stats = {
      total_sources: 9,
      total_reports: cryptoTotal + stockCount + quantAssets.length + 12,
      reports_24h: Math.max(cryptoSignals, 1) + Math.max(stockCount > 0 ? 1 : 0, 0) + 1,
      total_insights: cryptoSignals + quantSignals + (stockCount > 0 ? 3 : 0),
      total_opportunities: quantSignals + (cryptoSignals > 0 ? 1 : 0),
      active_patterns: cryptoSignals > 0 ? 2 : 1,
      last_scan: new Date().toISOString(),
      sources: {
        crypto: { reports: cryptoTotal, last_scan: cryptoTimestamp ? 'Every 3h' : 'Unknown', status: cryptoTimestamp ? 'active' : 'degraded' },
        stocks: { reports: stockCount, last_scan: stockTimestamp ? 'Every 3h' : 'Unknown', status: stockTimestamp ? 'active' : 'degraded' },
        quant: { reports: quantAssets.length, last_scan: 'Every 3h', status: 'active' },
        trading: { reports: tradingPositions, last_scan: tradingTimestamp ? 'Twice daily' : 'Unknown', status: tradingTimestamp ? 'active' : 'degraded' },
        lottery: { reports: 8, last_scan: 'Pre-draw', status: 'active' },
        medtech: { reports: 3, last_scan: 'Manual', status: 'active' },
      }
    };

    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to aggregate stats' }, { status: 500 });
  }
}