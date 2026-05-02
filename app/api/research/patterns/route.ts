import { NextResponse } from 'next/server';

// Active patterns detected across intelligence systems
export async function GET() {
  const patterns = [
    {
      id: 'btc-regime-bearish',
      name: 'BTC Regime: Bearish',
      type: 'macro',
      source: 'TrojanVue',
      description: 'Bitcoin trending below SMA50. Short signals dominate. 6 of 9 open positions are shorts.',
      confidence: 0.85,
      first_seen: '2026-04-29',
      last_seen: new Date().toISOString().split('T')[0],
      status: 'active'
    },
    {
      id: 'crypto-consolidation',
      name: 'Crypto Market Consolidation',
      type: 'market',
      source: 'CryptoVue',
      description: 'Top-200 showing low signal count. Most assets in neutral territory. Compression phase likely.',
      confidence: 0.70,
      first_seen: '2026-05-01',
      last_seen: new Date().toISOString().split('T')[0],
      status: 'active'
    },
    {
      id: 'quant-neutral',
      name: 'QuantVue: All Models Neutral',
      type: 'quant',
      source: 'QuantVue',
      description: 'All 5 quantitative models showing NO_SIGNAL across BTC, ETH, XRP, SOL, BNB. Normal volatility regime.',
      confidence: 0.60,
      first_seen: '2026-05-02',
      last_seen: new Date().toISOString().split('T')[0],
      status: 'active'
    },
    {
      id: 'meme-risk',
      name: 'Meme Token Volatility Spike',
      type: 'risk',
      source: 'TrojanVue',
      description: 'WIF short exited at -11.56%. Meme tokens showing extreme volatility. Shorting meme coins during regime uncertainty carries elevated risk.',
      confidence: 0.90,
      first_seen: '2026-05-01',
      last_seen: new Date().toISOString().split('T')[0],
      status: 'active'
    },
    {
      id: 'neuro-gaps',
      name: 'MedTech Portfolio Gaps',
      type: 'competitive',
      source: 'NeuroVue',
      description: 'Wallaby Phenox has no intrasaccular device. Medtronic Artisse and Stryker Contour gaining share in flow diverter segment.',
      confidence: 0.80,
      first_seen: '2026-03-25',
      last_seen: '2026-03-25',
      status: 'active'
    },
  ];

  return NextResponse.json(patterns);
}