import { NextResponse } from 'next/server';

const VUEROO_DATA_BASE = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes, quantRes, tradingRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA_BASE}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/data/quantvue/signals.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/trading/dashboard.json?t=${Date.now()}`),
    ]);

    const patterns = [];
    const today = new Date().toISOString().split('T')[0];

    // Crypto pattern from live data
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      const buySignals = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
      const sellSignals = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
      const holdCount = (crypto.results || []).filter((r: any) => r.signal === 'hold').length;

      if (crypto.signals_found === 0) {
        patterns.push({
          id: 'crypto-consolidation',
          name: 'Crypto Market Consolidation',
          type: 'market',
          source: 'CryptoVue',
          description: `${crypto.total_symbols} assets scanned. ${holdCount} in hold, ${buySignals} long, ${sellSignals} short. Low signal count = compression phase.`,
          confidence: 0.70,
          first_seen: '2026-05-01',
          last_seen: today,
          status: 'active'
        });
      } else if (sellSignals > buySignals) {
        patterns.push({
          id: 'crypto-bearish-bias',
          name: 'Crypto Bearish Bias',
          type: 'market',
          source: 'CryptoVue',
          description: `${sellSignals} short signals vs ${buySignals} long signals across ${crypto.total_symbols} assets. Bearish momentum detected.`,
          confidence: 0.80,
          first_seen: today,
          last_seen: today,
          status: 'active'
        });
      } else if (buySignals > sellSignals) {
        patterns.push({
          id: 'crypto-bullish-bias',
          name: 'Crypto Bullish Bias',
          type: 'market',
          source: 'CryptoVue',
          description: `${buySignals} long signals vs ${sellSignals} short signals across ${crypto.total_symbols} assets. Bullish momentum detected.`,
          confidence: 0.80,
          first_seen: today,
          last_seen: today,
          status: 'active'
        });
      }
    }

    // QuantVue pattern from live data
    if (quantRes.status === 'fulfilled' && quantRes.value.ok) {
      const quant = await quantRes.value.json();
      const assets = Object.keys(quant);
      const activeSignals = assets.filter(a => {
        const d = (quant as any)[a];
        return d.consensus_signal && d.consensus_signal !== 'NO_SIGNAL';
      });

      if (activeSignals.length === 0) {
        patterns.push({
          id: 'quant-neutral',
          name: 'QuantVue: All Models Neutral',
          type: 'quant',
          source: 'QuantVue',
          description: `All 5 quantitative models showing NO_SIGNAL across ${assets.length} assets. Normal volatility regime. No trades recommended.`,
          confidence: 0.60,
          first_seen: today,
          last_seen: today,
          status: 'active'
        });
      } else {
        patterns.push({
          id: 'quant-active',
          name: `QuantVue: ${activeSignals.length} Active Signal${activeSignals.length > 1 ? 's' : ''}`,
          type: 'quant',
          source: 'QuantVue',
          description: `Active signals on: ${activeSignals.join(', ')}. Multi-model consensus detected.`,
          confidence: 0.75,
          first_seen: today,
          last_seen: today,
          status: 'active'
        });
      }
    }

    // TrojanVue pattern from live data
    if (tradingRes.status === 'fulfilled' && tradingRes.value.ok) {
      const trading = await tradingRes.value.json();
      patterns.push({
        id: 'btc-regime',
        name: `BTC Regime: ${trading.btc_regime || 'Unknown'}`,
        type: 'macro',
        source: 'TrojanVue',
        description: `Bitcoin ${trading.btc_regime?.toLowerCase() || 'unknown'} regime. ${trading.open_positions || 0} open positions. Total P&L: €${trading.total_pnl_eur?.toFixed(2) || '0.00'}.`,
        confidence: 0.85,
        first_seen: trading.timestamp?.split('T')[0] || today,
        last_seen: today,
        status: 'active'
      });
    }

    // MedTech pattern (from NeuroVue — static)
    patterns.push({
      id: 'neuro-gaps',
      name: 'MedTech Portfolio Gaps',
      type: 'competitive',
      source: 'NeuroVue',
      description: 'Wallaby Phenox has no intrasaccular device. Medtronic Artisse and Stryker Contour gaining share in flow diverter segment.',
      confidence: 0.80,
      first_seen: '2026-03-25',
      last_seen: today,
      status: 'active'
    });

    return NextResponse.json(patterns, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}