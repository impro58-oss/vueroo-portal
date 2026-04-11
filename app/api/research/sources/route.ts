import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { name: 'McKinsey & Company', type: 'consulting', scan_status: 'never', reports_count: 0 },
    { name: 'Boston Consulting Group', type: 'consulting', scan_status: 'never', reports_count: 0 },
    { name: 'PwC Strategy&', type: 'consulting', scan_status: 'never', reports_count: 0 },
    { name: 'FDA News', type: 'medtech', scan_status: 'never', reports_count: 0 },
    { name: 'ClinicalTrials.gov', type: 'medtech', scan_status: 'never', reports_count: 0 }
  ]);
}

