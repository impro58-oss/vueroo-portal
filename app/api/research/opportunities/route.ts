import { NextResponse } from 'next/server';

const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
    ]);

    const opportunities = [];

    // CryptoVue opportunities from live signals
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const crypto = await cryptoRes.value.json();
      if (crypto.signals_found > 0) {
        const buySignals = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
        const sellSignals = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
        opportunities.push({
          id: 'crypto-signals', name: `Crypto: ${buySignals} Long, ${sellSignals} Short Signals`,
          type: 'market', source: 'CryptoVue',
          description: `${crypto.total_symbols} scanned. ${crypto.signals_found} actionable signals detected. Auto-refreshes every 3h.`,
          potential_return: buySignals > sellSignals ? 'Bullish bias' : 'Bearish bias',
          risk_level: 'Medium', confidence: 0.70, status: 'active',
          created: crypto.scan_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      } else {
        opportunities.push({
          id: 'crypto-consolidation', name: 'Crypto Market Consolidation',
          type: 'market', source: 'CryptoVue',
          description: `${crypto.total_symbols} scanned. No strong signals — compression phase likely. Breakout imminent.`,
          potential_return: 'High (post-breakout)', risk_level: 'Medium', confidence: 0.60, status: 'monitoring',
          created: crypto.scan_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      }
    }

    // Static opportunities
    opportunities.push(
      {
        id: 'quant-wait', name: 'QuantVue: Wait for Signal',
        type: 'quant', source: 'QuantVue',
        description: 'All 5 models showing neutral/low confidence. No position recommended until consensus reaches 60%+.',
        potential_return: 'N/A', risk_level: 'Low', confidence: 0.90, status: 'wait',
        created: new Date().toISOString().split('T')[0]
      },
      {
        id: 'medtech-flow-diverter', name: 'Flow Diverter Market Gap (Wallaby)',
        type: 'competitive', source: 'NeuroVue',
        description: 'Wallaby Phenox has no intrasaccular flow diverter. Medtronic Artisse and Stryker Contour entering.',
        potential_return: 'High', risk_level: 'High', confidence: 0.75, status: 'monitoring',
        created: '2026-03-25'
      }
    );

    return NextResponse.json(opportunities, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load opportunities' }, { status: 500 });
  }
}