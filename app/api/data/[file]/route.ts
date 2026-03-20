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
    const session = request.cookies.get('session');
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

    // Fetch from GitHub
    const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${file}.json?ref=${GITHUB_BRANCH}`;
    
    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vueroo-API'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const jsonData = JSON.parse(content);

    // Return JSON with caching headers
    return NextResponse.json(jsonData, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 min cache
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}