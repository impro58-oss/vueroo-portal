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

    // Try API endpoint with raw media type for private repos
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${file}.json?ref=${GITHUB_BRANCH}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.raw',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('GitHub API error:', response.status, errorBody);
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    // For raw endpoint, response is direct JSON
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