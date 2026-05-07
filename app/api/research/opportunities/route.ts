import { NextResponse } from 'next/server';

const VUEROO_DATA_BASE = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    // Fetch live trading data for real opportunities
    const [tradingRes, cryptoRes, quantRes] = await Promise.allSettled([
      fetch(`https://www.vueroo.com/trading/dashboard.json?t=${Date.now()}`),
      fetch(`${VUEROO_DATA_BASE}/crypto/crypto_latest.json?t=${Date.now()}`),
      fetch(`https://www.vueroo.com/data/quantvue/signals.json?t=${Date.now()}`),
    ]);

    const opportunities = [];

    // TrojanVue opportunities from live positions
    if (tradingRes.status === 'fulfilled' && tradingRes.value.ok) {
      const trading = await tradingRes.value.json();
      if (trading.open_positions > 0) {
        opportunities.push({
          id: 'trojanvue-active',
          name: `${trading.open_positions} Open Paper Trading Positions`,
          type: 'trading',
          source: 'TrojanVue',
          description: `V5.1 Donchian system tracking ${trading.universe_size || 200} pairs. Total P&L: €${trading.total_pnl_eur?.toFixed(2) || '0.00'}. BTC regime: ${trading.btc_regime || 'Unknown'}.`,
          potential_return: trading.total_pnl_eur > 0 ? 'Positive' : 'Negative',
          risk_level: 'Medium',
          confidence: 0.85,
          status: 'active',
          created: trading.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      }
    }

    // CryptoVue opportunities from live signals
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      if (crypto.signals_found > 0) {
        const buySignals = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
        const sellSignals = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
        opportunities.push({
          id: 'crypto-signals',
          name: `Crypto: ${buySignals} Long, ${sellSignals} Short Signals`,
          type: 'market',
          source: 'CryptoVue',
          description: `${crypto.total_symbols} scanned. ${crypto.signals_found} actionable signals detected. Auto-refreshes every 3h.`,
          potential_return: buySignals > sellSignals ? 'Bullish bias' : 'Bearish bias',
          risk_level: 'Medium',
          confidence: 0.70,
          status: 'active',
          created: crypto.scan_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      } else {
        opportunities.push({
          id: 'crypto-consolidation',
          name: 'Crypto Market Consolidation',
          type: 'market',
          source: 'CryptoVue',
          description: `${crypto.total_symbols} scanned. No strong signals — compression phase likely. Breakout imminent.`,
          potential_return: 'High (post-breakout)',
          risk_level: 'Medium',
          confidence: 0.60,
          status: 'monitoring',
          created: crypto.scan_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      }
    }

    // QuantVue opportunities from live signals
    if (quantRes.status === 'fulfilled' && quantRes.value.ok) {
      const quant = await quantRes.value.json();
      for (const [asset, data] of Object.entries(quant)) {
        const d = data as any;
        if (d.consensus_signal && d.consensus_signal !== 'NO_SIGNAL') {
          opportunities.push({
            id: `quant-${asset.toLowerCase()}`,
            name: `QuantVue: ${asset} ${d.consensus_signal}`,
            type: 'quant',
            source: 'QuantVue',
            description: `5-model consensus: ${d.consensus_signal} at ${(d.consensus_confidence * 100).toFixed(1)}% confidence. Regime: ${d.risk_regime || 'Normal'}.`,
            potential_return: d.consensus_signal === 'STRONG_BUY' || d.consensus_signal === 'BUY' ? 'Positive' : 'Negative',
            risk_level: d.risk_regime === 'HIGH_RISK' ? 'High' : 'Medium',
            confidence: d.consensus_confidence || 0.5,
            status: 'active',
            created: d.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
          });
        }
      }
      if (opportunities.filter(o => o.source === 'QuantVue').length === 0) {
        opportunities.push({
          id: 'quant-wait',
          name: 'QuantVue: Wait for Signal',
          type: 'quant',
          source: 'QuantVue',
          description: 'All 5 models showing neutral/low confidence. No position recommended until consensus reaches 60%+.',
          potential_return: 'N/A',
          risk_level: 'Low',
          confidence: 0.90,
          status: 'wait',
          created: new Date().toISOString().split('T')[0]
        });
      }
    }

    // MedTech opportunity (static — from NeuroVue intel)
    opportunities.push({
      id: 'medtech-flow-diverter',
      name: 'Flow Diverter Market Gap (Wallaby)',
      type: 'competitive',
      source: 'NeuroVue',
      description: 'Wallaby Phenox has no intrasaccular flow diverter. Medtronic Artisse and Stryker Contour entering. Partnership or acquisition opportunity.',
      potential_return: 'High',
      risk_level: 'High',
      confidence: 0.75,
      status: 'monitoring',
      created: '2026-03-25'
    });

    return NextResponse.json(opportunities, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load opportunities' }, { status: 500 });
  }
}