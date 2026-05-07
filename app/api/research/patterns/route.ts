import { NextResponse } from 'next/server';
import { fetchJSON, VUEROO_DATA } from '../../lib';

export async function GET() {
  try {
    const crypto = await fetchJSON(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`);
    const patterns = [];
    const today = new Date().toISOString().split('T')[0];

    if (crypto) {
      const buy = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
      const sell = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
      const hold = (crypto.results || []).filter((r: any) => r.signal === 'hold').length;
      if (crypto.signals_found === 0) {
        patterns.push({ id: 'crypto-consolidation', name: 'Crypto Market Consolidation', type: 'market', source: 'CryptoVue', description: `${crypto.total_symbols} scanned. ${hold} hold, ${buy} long, ${sell} short.`, confidence: 0.70, first_seen: today, last_seen: today, status: 'active' });
      } else if (sell > buy) {
        patterns.push({ id: 'crypto-bearish', name: 'Crypto Bearish Bias', type: 'market', source: 'CryptoVue', description: `${sell} short vs ${buy} long across ${crypto.total_symbols}.`, confidence: 0.80, first_seen: today, last_seen: today, status: 'active' });
      } else {
        patterns.push({ id: 'crypto-bullish', name: 'Crypto Bullish Bias', type: 'market', source: 'CryptoVue', description: `${buy} long vs ${sell} short across ${crypto.total_symbols}.`, confidence: 0.80, first_seen: today, last_seen: today, status: 'active' });
      }
    }

    patterns.push(
      { id: 'quant-neutral', name: 'QuantVue: All Models Neutral', type: 'quant', source: 'QuantVue', description: 'All 5 models showing NO_SIGNAL. Normal regime.', confidence: 0.60, first_seen: today, last_seen: today, status: 'active' },
      { id: 'neuro-gaps', name: 'MedTech Portfolio Gaps', type: 'competitive', source: 'NeuroVue', description: 'Flow diverter gap in Wallaby Phenox portfolio.', confidence: 0.80, first_seen: '2026-03-25', last_seen: today, status: 'active' }
    );

    return NextResponse.json(patterns, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 });
  }
}