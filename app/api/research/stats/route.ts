import { NextResponse } from 'next/server';

// All data fetched from GitHub raw URLs — no circular references to vueroo.com
const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';
const ROOQUEST_DATA = 'https://raw.githubusercontent.com/impro58-oss/rooquest1/master/data';

export async function GET() {
  try {
    const [cryptoRes, stocksRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
      fetch(`${VUEROO_DATA}/stocks/stocks_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
    ]);

    let cryptoTotal = 0, cryptoSignals = 0, cryptoTimestamp = '';
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

    const stats = {
      total_sources: 9,
      total_reports: cryptoTotal + stockCount + 5 + 12,
      reports_24h: Math.max(cryptoSignals, 1) + (stockCount > 0 ? 1 : 0) + 1,
      total_insights: cryptoSignals + (stockCount > 0 ? 3 : 0),
      total_opportunities: cryptoSignals > 0 ? 2 : 1,
      active_patterns: cryptoSignals > 0 ? 2 : 1,
      last_scan: new Date().toISOString(),
      sources: {
        crypto: { reports: cryptoTotal, last_scan: cryptoTimestamp ? 'Every 3h' : 'Unknown', status: cryptoTimestamp ? 'active' : 'degraded' },
        stocks: { reports: stockCount, last_scan: stockTimestamp ? 'Every 3h' : 'Unknown', status: stockTimestamp ? 'active' : 'degraded' },
        quant: { reports: 5, last_scan: 'Every 3h', status: 'active' },
        trading: { reports: 9, last_scan: 'Twice daily', status: 'active' },
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