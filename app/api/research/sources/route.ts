import { NextResponse } from 'next/server';

// Research sources - our active intelligence feeds
export async function GET() {
  const sources = [
    { id: 'cryptovue', name: 'CryptoVue Scanner', type: 'crypto', scan_status: 'active', reports_count: 89, description: 'Top-200 crypto scanner with RSI, MTF, and channel analysis', frequency: 'Every 3 hours', last_scan: new Date().toISOString() },
    { id: 'stockvue', name: 'StockVue Alpha Vantage', type: 'stocks', scan_status: 'active', reports_count: 34, description: '12 US equities with price, momentum, and signal tracking', frequency: 'Every 3 hours', last_scan: new Date().toISOString() },
    { id: 'quantvue', name: 'QuantVue 5-Model Ensemble', type: 'quant', scan_status: 'active', reports_count: 10, description: 'Multi-model consensus: Linear Regression, Kalman, ARIMA, HMM, GARCH', frequency: 'Every 3 hours', last_scan: new Date().toISOString() },
    { id: 'trojanvue', name: 'TrojanVue Paper Trader', type: 'trading', scan_status: 'active', reports_count: 12, description: 'Donchian channel + SMA50 trend following on 198 Binance pairs', frequency: 'Twice daily', last_scan: new Date().toISOString() },
    { id: 'lotteryvue', name: 'LotteryVue Harmonic', type: 'lottery', scan_status: 'active', reports_count: 8, description: 'Signal-aware prediction engine for Irish Lotto and EuroMillions', frequency: 'Pre-draw', last_scan: new Date().toISOString() },
    { id: 'neurovue', name: 'NeuroVue MedTech Intel', type: 'medtech', scan_status: 'active', reports_count: 3, description: 'Neurovascular competitive intelligence with portfolio matrix', frequency: 'Manual refresh', last_scan: '2026-03-25T00:00:00Z' },
  ];

  return NextResponse.json(sources);
}