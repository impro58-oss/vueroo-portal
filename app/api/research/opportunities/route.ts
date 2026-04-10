import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .in('status', ['identified', 'validating', 'actionable'])
      .order('opportunity_score', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Opportunities error:', error);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json([]);
  }
}
