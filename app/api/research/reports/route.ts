import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const source = searchParams.get('source');
    
    let query = supabase
      .from('reports')
      .select('*, sources(name, type)')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (source) {
      query = query.eq('sources.name', source);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Reports error:', error);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json([]);
  }
}
