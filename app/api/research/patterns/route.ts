import { NextResponse } from 'next/server';

const VUEROO_DATA = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data';

export async function GET() {
  try {
    const [cryptoRes] = await Promise.allSettled([
      fetch(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`, { next: { revalidate: 60 } }),
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
          id: 'crypto-consolidation', name: 'Crypto Market Consolidation', type: 'market', source: 'CryptoVue',
          description: `${crypto.total_symbols} assets scanned. ${holdCount} in hold, ${buySignals} long, ${sellSignals} short. Low signal count = compression phase.`,
          confidence: 0.70, first_seen: '2026-05-01', last_seen: today, status: 'active'
        });
      } else if (sellSignals > buySignals) {
        patterns.push({
          id: 'crypto-bearish-bias', name: 'Crypto Bearish Bias', type: 'market', source: 'CryptoVue',
          description: `${sellSignals} short signals vs ${buySignals} long signals across ${crypto.total_symbols} assets.`,
          confidence: 0.80, first_seen: today, last_seen: today, status: 'active'
        });
      } else {
        patterns.push({
          id: 'crypto-bullish-bias', name: 'Crypto Bullish Bias', type: 'market', source: 'CryptoVue',
          description: `${buySignals} long signals vs ${sellSignals} short signals across ${crypto.total_symbols} assets.`,
          confidence: 0.80, first_seen: today, last_seen: today, status: 'active'
        });
      }
    }

    // Static patterns
    patterns.push(
      { id: 'quant-neutral', name: 'QuantVue: All Models Neutral', type: 'quant', source: 'QuantVue',
        description: 'All 5 quantitative models showing NO_SIGNAL across 5 assets. Normal volatility regime.',
        confidence: 0.60, first_seen: today, last_seen: today, status: 'active' },
      { id: 'neuro-gaps', name: 'MedTech Portfolio Gaps', type: 'competitive', source: 'NeuroVue',
        description: 'Wallaby Phenox has no intrasaccular device. Medtronic Artisse and Stryker Contour gaining share.',
        confidence: 0.80, first_seen: '2026-03-25', last_seen: today, status: 'active' }
    );

    return NextResponse.json(patterns, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}