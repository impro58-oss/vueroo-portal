import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data/crypto/crypto_latest.json';
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'vueroo-portal/1.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'GitHub fetch failed', 
        status: response.status 
      }, { status: 502 });
    }
    
    // Get raw text first to check for NaN
    const text = await response.text();
    
    // Replace NaN with null for valid JSON
    const cleaned = text.replace(/\bNaN\b/g, 'null');
    
    // Parse cleaned JSON
    const data = JSON.parse(cleaned);
    
    return NextResponse.json({ 
      success: true, 
      total_symbols: data.total_symbols,
      signals_found: data.signals_found,
      scan_timestamp: data.scan_timestamp,
      nan_fixed: text !== cleaned
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Fetch error', 
      message: error.message,
      cause: error.cause?.message 
    }, { status: 500 });
  }
}