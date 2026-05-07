import { NextResponse } from 'next/server';
import { fetchJSON, VUEROO_DATA } from '../../lib';

export async function GET() {
  try {
    const [crypto, stocks] = await Promise.all([
      fetchJSON(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetchJSON(`${VUEROO_DATA}/stocks/stocks_latest.json?t=${Date.now()}`),
    ]);

    const sources = [];

    if (crypto) sources.push({ id: 'cryptovue', name: 'CryptoVue Scanner', type: 'crypto', scan_status: 'active', reports_count: crypto.total_symbols || 0, signals_count: crypto.signals_found || 0, description: 'Top-200 crypto scanner with RSI, MTF, and channel analysis', frequency: 'Every 3 hours', last_scan: crypto.scan_timestamp || new Date().toISOString() });
    else sources.push({ id: 'cryptovue', name: 'CryptoVue Scanner', type: 'crypto', scan_status: 'degraded', reports_count: 0, description: 'Data unavailable', frequency: 'Every 3 hours', last_scan: new Date().toISOString() });

    if (stocks) sources.push({ id: 'stockvue', name: 'StockVue Alpha Vantage', type: 'stocks', scan_status: 'active', reports_count: stocks.stocks?.length || 0, description: 'US equities with price, momentum, and signal tracking', frequency: 'Every 3 hours', last_scan: stocks.timestamp || new Date().toISOString() });
    else sources.push({ id: 'stockvue', name: 'StockVue Alpha Vantage', type: 'stocks', scan_status: 'degraded', reports_count: 0, description: 'Data unavailable', frequency: 'Every 3 hours', last_scan: new Date().toISOString() });

    sources.push(
      { id: 'quantvue', name: 'QuantVue 5-Model Ensemble', type: 'quant', scan_status: 'active', reports_count: 5, description: 'Multi-model consensus: LR, Kalman, ARIMA, HMM, GARCH', frequency: 'Every 3 hours', last_scan: new Date().toISOString() },
      { id: 'trojanvue', name: 'TrojanVue Paper Trader', type: 'trading', scan_status: 'active', reports_count: 9, description: 'Donchian channel + SMA50 on 198 Binance pairs', frequency: 'Twice daily', last_scan: new Date().toISOString() },
      { id: 'lotteryvue', name: 'LotteryVue Harmonic', type: 'lottery', scan_status: 'active', reports_count: 8, description: 'Signal-aware prediction for Irish Lotto and EuroMillions', frequency: 'Pre-draw', last_scan: new Date().toISOString() },
      { id: 'neurovue', name: 'NeuroVue MedTech Intel', type: 'medtech', scan_status: 'active', reports_count: 3, description: 'Neurovascular competitive intelligence', frequency: 'Manual refresh', last_scan: new Date().toISOString() }
    );

    return NextResponse.json(sources, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load sources' }, { status: 500 });
  }
}