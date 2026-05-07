import { NextResponse } from 'next/server';

const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes, stocksRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
      fetch(`${VUEROO_DATA}/stocks/stocks_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
    ]);

    const sources = [];

    // CryptoVue
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const data = await cryptoRes.value.json();
      sources.push({
        id: 'cryptovue', name: 'CryptoVue Scanner', type: 'crypto', scan_status: 'active',
        reports_count: data.total_symbols || 0, signals_count: data.signals_found || 0,
        description: 'Top-200 crypto scanner with RSI, MTF, and channel analysis',
        frequency: 'Every 3 hours', last_scan: data.scan_timestamp || new Date().toISOString()
      });
    } else {
      sources.push({ id: 'cryptovue', name: 'CryptoVue Scanner', type: 'crypto', scan_status: 'degraded', reports_count: 0, description: 'Data fetch failed', frequency: 'Every 3 hours', last_scan: new Date().toISOString() });
    }

    // StockVue
    if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
      const data = await stocksRes.value.json();
      sources.push({
        id: 'stockvue', name: 'StockVue Alpha Vantage', type: 'stocks', scan_status: 'active',
        reports_count: data.stocks?.length || 0,
        description: 'US equities with price, momentum, and signal tracking',
        frequency: 'Every 3 hours', last_scan: data.timestamp || new Date().toISOString()
      });
    } else {
      sources.push({ id: 'stockvue', name: 'StockVue Alpha Vantage', type: 'stocks', scan_status: 'degraded', reports_count: 0, description: 'Data fetch failed', frequency: 'Every 3 hours', last_scan: new Date().toISOString() });
    }

    // Static sources
    sources.push(
      { id: 'quantvue', name: 'QuantVue 5-Model Ensemble', type: 'quant', scan_status: 'active', reports_count: 5, description: 'Multi-model consensus: Linear Regression, Kalman, ARIMA, HMM, GARCH', frequency: 'Every 3 hours', last_scan: new Date().toISOString() },
      { id: 'trojanvue', name: 'TrojanVue Paper Trader', type: 'trading', scan_status: 'active', reports_count: 9, description: 'Donchian channel + SMA50 trend following on 198 Binance pairs', frequency: 'Twice daily', last_scan: new Date().toISOString() },
      { id: 'lotteryvue', name: 'LotteryVue Harmonic', type: 'lottery', scan_status: 'active', reports_count: 8, description: 'Signal-aware prediction engine for Irish Lotto and EuroMillions', frequency: 'Pre-draw', last_scan: new Date().toISOString() },
      { id: 'neurovue', name: 'NeuroVue MedTech Intel', type: 'medtech', scan_status: 'active', reports_count: 3, description: 'Neurovascular competitive intelligence with portfolio matrix', frequency: 'Manual refresh', last_scan: new Date().toISOString() }
    );

    return NextResponse.json(sources, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load sources' }, { status: 500 });
  }
}