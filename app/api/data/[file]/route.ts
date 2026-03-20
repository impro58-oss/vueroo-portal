import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'impro58-oss/medtech-intelligence-data';
const GITHUB_BRANCH = 'main';

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  try {
    // Check authentication
    const session = request.cookies.get('vueroo-session');
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { file } = params;
    const allowedFiles = ['epidemiological-data', 'competition-data', 'portfolio-data'];
    
    if (!allowedFiles.includes(file)) {
      return NextResponse.json(
        { error: 'Invalid file requested' },
        { status: 400 }
      );
    }

    // Try raw GitHub content URL (simpler, no API needed)
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${file}.json`;
    
    const response = await fetch(rawUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('GitHub fetch error:', response.status, rawUrl);
      throw new Error(`GitHub error: ${response.status}`);
    }
    
    const jsonData = await response.json();

    // Return JSON with caching headers
    return NextResponse.json(jsonData, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 min cache
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}