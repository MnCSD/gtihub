import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepositoryFiles } from '@/lib/languageAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const { repositoryFiles } = await request.json();
    
    if (!repositoryFiles || !Array.isArray(repositoryFiles)) {
      return NextResponse.json(
        { error: 'Repository files array is required' },
        { status: 400 }
      );
    }

    const languageStats = analyzeRepositoryFiles(repositoryFiles);
    
    return NextResponse.json({ languages: languageStats });
  } catch (error) {
    console.error('Language analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze languages' },
      { status: 500 }
    );
  }
}