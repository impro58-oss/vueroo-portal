import { NextResponse } from 'next/server';
import { fetchJSON, VUEROO_DATA } from '../../lib';

export async function GET() {
  try {
    const crypto = await fetchJSON(`${VUEROO_DATA}/crypto/crypto_latest.json?t=${Date.now()}`);
    const opportunities = [];

    if (crypto && crypto.signals_found > 0) {
      const buy = (crypto.results || []).filter((r: any) => r.signal === 'buy').length;
      const sell = (crypto.results || []).filter((r: any) => r.signal === 'sell').length;
      opportunities.push({ id: 'crypto-signals', name: `Crypto: ${buy} Long, ${sell} Short`, type: 'market', source: 'CryptoVue', description: `${crypto.total_symbols} scanned. ${crypto.signals_found} signals.`, potential_return: buy > sell ? 'Bullish bias' : 'Bearish bias', risk_level: 'Medium', confidence: 0.70, status: 'active', created: crypto.scan_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0] });
    } else {
      opportunities.push({ id: 'crypto-consolidation', name: 'Crypto Market Consolidation', type: 'market', source: 'CryptoVue', description: 'Compression phase. Breakout imminent.', potential_return: 'High (post-breakout)', risk_level: 'Medium', confidence: 0.60, status: 'monitoring', created: new Date().toISOString().split('T')[0] });
    }

    opportunities.push(
      { id: 'quant-wait', name: 'QuantVue: Wait for Signal', type: 'quant', source: 'QuantVue', description: 'All 5 models neutral. Wait for 60%+ consensus.', potential_return: 'N/A', risk_level: 'Low', confidence: 0.90, status: 'wait', created: new Date().toISOString().split('T')[0] },
      { id: 'medtech-flow', name: 'Flow Diverter Market Gap', type: 'competitive', source: 'NeuroVue', description: 'Wallaby Phenox gap. Artisse/Contour entering.', potential_return: 'High', risk_level: 'High', confidence: 0.75, status: 'monitoring', created: '2026-03-25' }
    );

    return NextResponse.json(opportunities, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load opportunities' }, { status: 500 });
  }
}