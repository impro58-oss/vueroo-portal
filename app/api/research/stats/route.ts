import { NextResponse } from 'next/server';

// Fallback stats data - returns immediately without database
export async function GET() {
  return NextResponse.json({
    total_sources: 7,
    total_reports: 0,
    reports_24h: 0,
    total_insights: 0,
    total_opportunities: 0,
    active_patterns: 0,
    last_scan: null
  });
}

