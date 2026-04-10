import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    
    if (error) {
      console.error('Stats error:', error);
      // Return fallback data
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
    
    return NextResponse.json(data[0] || {
      total_sources: 7,
      total_reports: 0,
      reports_24h: 0,
      total_insights: 0,
      total_opportunities: 0,
      active_patterns: 0,
      last_scan: null
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        total_sources: 7,
        total_reports: 0,
        reports_24h: 0,
        total_insights: 0,
        total_opportunities: 0,
        active_patterns: 0,
        last_scan: null,
        error: 'Database not yet configured'
      },
      { status: 200 } // Return 200 with fallback data
    );
  }
}
