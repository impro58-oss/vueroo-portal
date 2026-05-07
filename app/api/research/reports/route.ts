import { NextResponse } from 'next/server';

const VUEROO_DATA_BASE = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes, stocksRes, quantRes, tradingRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA_BASE}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetch(`${VUEROO_DATA_BASE}/stocks/stocks_latest.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/data/quantvue/signals.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/trading/dashboard.json?t=${Date.now()}`),
    ]);

    const reports = [];
    const today = new Date().toISOString().split('T')[0];

    // CryptoVue report
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      const buySignals = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
      const sellSignals = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
      reports.push({
        id: 'crypto-daily',
        source: 'CryptoVue Scanner',
        title: 'Top-200 Crypto Market Scan',
        type: 'crypto',
        date: crypto.scan_timestamp?.split('T')[0] || today,
        summary: `${crypto.total_symbols} cryptocurrencies tracked. ${crypto.signals_found} signals: ${buySignals} long, ${sellSignals} short. Auto-refreshes every 3 hours.`,
        confidence: crypto.signals_found > 0 ? 'high' : 'medium',
        category: 'Market Intelligence'
      });
    } else {
      reports.push({ id: 'crypto-daily', source: 'CryptoVue Scanner', title: 'Top-200 Crypto Market Scan', type: 'crypto', date: today, summary: 'Data fetch failed — scanner may be degraded.', confidence: 'low', category: 'Market Intelligence' });
    }

    // StockVue report
    if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
      const stocks = await stocksRes.value.json();
      const count = stocks.stocks?.length || 0;
      const topStock = stocks.stocks?.[0];
      reports.push({
        id: 'stock-daily',
        source: 'StockVue Alpha Vantage',
        title: 'US Equity Momentum Scan',
        type: 'stocks',
        date: stocks.timestamp?.split('T')[0] || stocks.timestamp?.split('T')[0] || today,
        summary: `${count} US equities tracked${topStock ? `. Top: ${topStock.symbol} at $${topStock.price} (${topStock.change_pct > 0 ? '+' : ''}${topStock.change_pct}%)` : ''}. Momentum-based signals with RSI.`,
        confidence: count > 0 ? 'medium' : 'low',
        category: 'Equity Analysis'
      });
    } else {
      reports.push({ id: 'stock-daily', source: 'StockVue Alpha Vantage', title: 'US Equity Momentum Scan', type: 'stocks', date: today, summary: 'Data fetch failed.', confidence: 'low', category: 'Equity Analysis' });
    }

    // QuantVue report
    if (quantRes.status === 'fulfilled' && quantRes.value.ok) {
      const quant = await quantRes.value.json();
      const assets = Object.keys(quant);
      const activeCount = assets.filter(a => { const d = (quant as any)[a]; return d.consensus_signal && d.consensus_signal !== 'NO_SIGNAL'; }).length;
      reports.push({
        id: 'quant-consensus',
        source: 'QuantVue 5-Model Ensemble',
        title: 'Multi-Model Consensus Report',
        type: 'quant',
        date: today,
        summary: `${assets.length} assets tracked across 5 models. ${activeCount} active consensus signals. Regime detection (HMM) + volatility filtering (GARCH).`,
        confidence: activeCount > 0 ? 'high' : 'medium',
        category: 'Quantitative Research'
      });
    } else {
      reports.push({ id: 'quant-consensus', source: 'QuantVue 5-Model Ensemble', title: 'Multi-Model Consensus Report', type: 'quant', date: today, summary: 'Data fetch failed.', confidence: 'low', category: 'Quantitative Research' });
    }

    // TrojanVue report
    if (tradingRes.status === 'fulfilled' && tradingRes.value.ok) {
      const trading = await tradingRes.value.json();
      reports.push({
        id: 'trojanvue-pnl',
        source: 'TrojanVue Paper Trader',
        title: 'Donchian Channel Trading Performance',
        type: 'trading',
        date: trading.timestamp?.split('T')[0] || today,
        summary: `V5.1 on ${trading.universe_size || 200} Binance pairs. ${trading.open_positions || 0} open positions. P&L: €${trading.total_pnl_eur?.toFixed(2) || '0.00'}. BTC regime: ${trading.btc_regime || 'Unknown'}.`,
        confidence: 'high',
        category: 'Trading Systems'
      });
    } else {
      reports.push({ id: 'trojanvue-pnl', source: 'TrojanVue Paper Trader', title: 'Donchian Channel Trading Performance', type: 'trading', date: today, summary: 'Data fetch failed.', confidence: 'low', category: 'Trading Systems' });
    }

    // LotteryVue report (no live API for this)
    reports.push({
      id: 'lotteryvue-signal',
      source: 'LotteryVue Harmonic',
      title: 'Harmonic Prediction Engine Status',
      type: 'lottery',
      date: today,
      summary: 'V9.1 signal-aware engine with V11 composition prediction. Irish Lotto and EuroMillions covered. Pre-draw predictions generated automatically.',
      confidence: 'medium',
      category: 'Probability Research'
    });

    // NeuroVue report (MedTech intel — static but verified)
    reports.push({
      id: 'neurovue-intel',
      source: 'NeuroVue MedTech Intel',
      title: 'Neurovascular Competitive Landscape',
      type: 'medtech',
      date: today,
      summary: '10 competitors tracked across 7 product categories. Portfolio gap analysis, revenue data, and clinical trial status.',
      confidence: 'high',
      category: 'MedTech Intelligence'
    });

    return NextResponse.json(reports, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}