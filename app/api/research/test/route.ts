import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://raw.githubusercontent.com/impro58-oss/vueroo-data/master/data/crypto/crypto_latest.json';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'vueroo-portal/1.0' },
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'GitHub fetch failed', 
        status: response.status,
        statusText: response.statusText 
      }, { status: 502 });
    }
    
    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      total_symbols: data.total_symbols,
      signals_found: data.signals_found,
      scan_timestamp: data.scan_timestamp
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Fetch error', 
      message: error.message,
      cause: error.cause?.message 
    }, { status: 500 });
  }
}