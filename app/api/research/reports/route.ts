import { NextResponse } from 'next/server';

const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes, stocksRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
      fetch(`${VUEROO_DATA}/stocks/stocks_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
    ]);

    const reports = [];
    const today = new Date().toISOString().split('T')[0];

    // CryptoVue
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      reports.push({
        id: 'crypto-daily', source: 'CryptoVue Scanner', title: 'Top-200 Crypto Market Scan',
        type: 'crypto', date: crypto.scan_timestamp?.split('T')[0] || today,
        summary: `${crypto.total_symbols} cryptocurrencies tracked. ${crypto.signals_found} signals detected. Auto-refreshes every 3 hours.`,
        confidence: crypto.signals_found > 0 ? 'high' : 'medium', category: 'Market Intelligence'
      });
    }

    // StockVue
    if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
      const stocks = await stocksRes.value.json();
      const count = stocks.stocks?.length || 0;
      reports.push({
        id: 'stock-daily', source: 'StockVue Alpha Vantage', title: 'US Equity Momentum Scan',
        type: 'stocks', date: stocks.timestamp?.split('T')[0] || today,
        summary: `${count} US equities tracked. Momentum-based signals with RSI.`,
        confidence: count > 0 ? 'medium' : 'low', category: 'Equity Analysis'
      });
    }

    // Static reports
    reports.push(
      { id: 'quant-consensus', source: 'QuantVue 5-Model Ensemble', title: 'Multi-Model Consensus Report',
        type: 'quant', date: today,
        summary: '5 assets tracked across 5 models. Consensus signals with regime detection (HMM) + volatility filtering (GARCH).',
        confidence: 'medium', category: 'Quantitative Research' },
      { id: 'trojanvue-pnl', source: 'TrojanVue Paper Trader', title: 'Donchian Channel Trading Performance',
        type: 'trading', date: today,
        summary: 'V5.1 on 198 Binance pairs. Donchian 20/10 + SMA50 filter. Real-time paper P&L tracking.',
        confidence: 'high', category: 'Trading Systems' },
      { id: 'lotteryvue-signal', source: 'LotteryVue Harmonic', title: 'Harmonic Prediction Engine Status',
        type: 'lottery', date: today,
        summary: 'V9.1 signal-aware engine with V11 composition prediction. Irish Lotto and EuroMillions covered.',
        confidence: 'medium', category: 'Probability Research' },
      { id: 'neurovue-intel', source: 'NeuroVue MedTech Intel', title: 'Neurovascular Competitive Landscape',
        type: 'medtech', date: today,
        summary: '10 competitors tracked across 7 product categories. Portfolio gap analysis and clinical trial status.',
        confidence: 'high', category: 'MedTech Intelligence' }
    );

    return NextResponse.json(reports, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}