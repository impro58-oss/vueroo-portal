import { NextResponse } from 'next/server';

// Research opportunities - actionable intelligence items
export async function GET() {
  const opportunities = [
    {
      id: 'short-btc-regime',
      name: 'Short Bias in Bearish BTC Regime',
      type: 'trading',
      source: 'TrojanVue',
      description: '6 of 9 open positions are shorts in bearish BTC regime. Trend following system indicates continued downside momentum.',
      potential_return: 'Medium',
      risk_level: 'Medium',
      confidence: 0.80,
      status: 'active',
      created: '2026-04-29'
    },
    {
      id: 'doge-long-setup',
      name: 'DOGE Long Breakout',
      type: 'trading',
      source: 'TrojanVue',
      description: 'DOGE broke above Donchian 20-day high. Currently at highest since entry (0.112). Trailing stop in place.',
      potential_return: 'High',
      risk_level: 'High',
      confidence: 0.70,
      status: 'active',
      created: '2026-04-29'
    },
    {
      id: 'crypto-consolidation-play',
      name: 'Post-Consolidation Breakout',
      type: 'market',
      source: 'CryptoVue',
      description: 'Low signal count suggests compression. Breakout imminent — watch for directional move once BTC resolves above/below SMA50.',
      potential_return: 'High',
      risk_level: 'Medium',
      confidence: 0.60,
      status: 'monitoring',
      created: '2026-05-01'
    },
    {
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
    },
    {
      id: 'quant-hold',
      name: 'QuantVue: Wait for Signal',
      type: 'quant',
      source: 'QuantVue',
      description: 'All 5 models showing neutral. No position recommended until consensus reaches 60%+ confidence.',
      potential_return: 'N/A',
      risk_level: 'Low',
      confidence: 0.90,
      status: 'wait',
      created: '2026-05-02'
    },
  ];

  return NextResponse.json(opportunities);
}