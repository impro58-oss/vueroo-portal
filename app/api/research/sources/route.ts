import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .order('last_scan', { ascending: false });
    
    if (error) {
      console.error('Sources error:', error);
      // Return seed data
      return NextResponse.json([
        { name: 'McKinsey & Company', type: 'consulting', scan_status: 'never', reports_count: 0 },
        { name: 'Boston Consulting Group', type: 'consulting', scan_status: 'never', reports_count: 0 },
        { name: 'PwC Strategy&', type: 'consulting', scan_status: 'never', reports_count: 0 },
        { name: 'FDA News', type: 'medtech', scan_status: 'never', reports_count: 0 },
        { name: 'ClinicalTrials.gov', type: 'medtech', scan_status: 'never', reports_count: 0 }
      ]);
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json([
      { name: 'McKinsey & Company', type: 'consulting', scan_status: 'never', reports_count: 0 },
      { name: 'Boston Consulting Group', type: 'consulting', scan_status: 'never', reports_count: 0 },
      { name: 'PwC Strategy&', type: 'consulting', scan_status: 'never', reports_count: 0 }
    ]);
  }
}
