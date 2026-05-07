import { NextResponse } from 'next/server';
import { fetchJSON, VUEROO_DATA } from '../../lib';

export async function GET() {
  try {
    const [crypto, stocks] = await Promise.all([
      fetchJSON(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetchJSON(`${VUEROO_DATA}/stocks/stocks_latest.json?t=${Date.now()}`),
    ]);

    const reports = [];
    const today = new Date().toISOString().split('T')[0];

    if (crypto) reports.push({ id: 'crypto-daily', source: 'CryptoVue Scanner', title: 'Top-200 Crypto Market Scan', type: 'crypto', date: crypto.scan_timestamp?.split('T')[0] || today, summary: `${crypto.total_symbols} tracked. ${crypto.signals_found} signals.`, confidence: crypto.signals_found > 0 ? 'high' : 'medium', category: 'Market Intelligence' });
    if (stocks) reports.push({ id: 'stock-daily', source: 'StockVue Alpha Vantage', title: 'US Equity Momentum Scan', type: 'stocks', date: stocks.timestamp?.split('T')[0] || today, summary: `${stocks.stocks?.length || 0} equities tracked.`, confidence: 'medium', category: 'Equity Analysis' });

    reports.push(
      { id: 'quant-consensus', source: 'QuantVue 5-Model Ensemble', title: 'Multi-Model Consensus Report', type: 'quant', date: today, summary: '5 assets across 5 models.', confidence: 'medium', category: 'Quantitative Research' },
      { id: 'trojanvue-pnl', source: 'TrojanVue Paper Trader', title: 'Donchian Channel Performance', type: 'trading', date: today, summary: 'V5.1 on 198 Binance pairs.', confidence: 'high', category: 'Trading Systems' },
      { id: 'lotteryvue', source: 'LotteryVue Harmonic', title: 'Harmonic Prediction Status', type: 'lottery', date: today, summary: 'V9.1 signal-aware engine.', confidence: 'medium', category: 'Probability Research' },
      { id: 'neurovue', source: 'NeuroVue MedTech Intel', title: 'Neurovascular Landscape', type: 'medtech', date: today, summary: '10 competitors, 7 categories.', confidence: 'high', category: 'MedTech Intelligence' }
    );

    return NextResponse.json(reports, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}