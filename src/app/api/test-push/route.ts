import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/test-push - Test endpoint with database operations using specific user
export async function POST(request: NextRequest) {
  try {
    console.log('Test push endpoint called');
    
    const { repositoryId, commits: commitsData, branch = 'main' } = await request.json();
    console.log('Request data:', { repositoryId, commitsCount: commitsData?.length, branch });
    console.log('First commit author:', commitsData?.[0]?.author);

    // Get user email from the latest commit's author info  
    let userEmail = 'mnikolopoylos@gmail.com'; // Default fallback
    
    if (commitsData && commitsData.length > 0) {
      // Use the last commit in the array (most recent)
      const latestCommit = commitsData[commitsData.length - 1];
      if (latestCommit.author?.email) {
        userEmail = latestCommit.author.email;
        console.log('Using email from latest commit author:', userEmail);
      }
    }

    // Find user by the configured email from CLI
    const testUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!testUser) {
      return NextResponse.json({ 
        error: `User not found with email: ${userEmail}. Please create an account with this email or check your gith config user.email setting.` 
      }, { status: 404 });
    }

    console.log('Found test user:', testUser.id);

    // Create repository if it doesn't exist
    let repository = await prisma.repository.findFirst({
      where: {
        name: repositoryId,
        ownerId: testUser.id
      }
    });

    if (!repository) {
      console.log('Creating new repository:', repositoryId);
      repository = await prisma.repository.create({
        data: {
          name: repositoryId,
          description: 'Test repository created by CLI',
          ownerId: testUser.id
        }
      });

      // Create default main branch
      await prisma.branch.create({
        data: {
          name: 'main',
          repositoryId: repository.id
        }
      });
    }

    console.log('Using repository:', repository.id);

    if (!commitsData || !Array.isArray(commitsData)) {
      return NextResponse.json({ error: 'Invalid commits data' }, { status: 400 });
    }

    const createdCommits = [];

    // Process commits in order (oldest first for proper parent relationships)
    for (const commitData of commitsData) {
      const { sha, message, author, committer, timestamp, treeHash, parentSha, files } = commitData;

      console.log('Processing commit:', sha);
      console.log('Commit files:', files ? files.length : 'no files', files);

      // Check if commit already exists
      const existingCommit = await prisma.commit.findUnique({
        where: { sha }
      });

      if (existingCommit) {
        console.log('Commit already exists, skipping:', sha);
        continue; // Skip if already exists
      }

      // Create the commit
      const commit = await prisma.commit.create({
        data: {
          sha,
          message,
          authorName: author.name,
          authorEmail: author.email,
          committerName: committer.name,
          committerEmail: committer.email,
          timestamp: new Date(timestamp),
          treeHash,
          parentSha,
          repositoryId: repository.id
        }
      });

      console.log('Created commit:', commit.id);

      // Create commit files
      if (files && Array.isArray(files)) {
        await prisma.commitFile.createMany({
          data: files.map((file: any) => ({
            commitId: commit.id,
            path: file.path,
            content: file.content,
            hash: file.hash,
            mode: file.mode || '100644',
            action: file.action || 'added'
          }))
        });

        console.log('Created', files.length, 'files for commit');
      }

      createdCommits.push(commit);
    }

    // Update branch reference if commits were created
    if (createdCommits.length > 0) {
      const latestCommit = createdCommits[createdCommits.length - 1];
      
      await prisma.branch.upsert({
        where: {
          repositoryId_name: {
            repositoryId: repository.id,
            name: branch
          }
        },
        update: {
          commitSha: latestCommit.sha
        },
        create: {
          name: branch,
          repositoryId: repository.id,
          commitSha: latestCommit.sha
        }
      });

      // Update repository updatedAt
      await prisma.repository.update({
        where: { id: repository.id },
        data: { updatedAt: new Date() }
      });

      console.log('Updated branch reference to:', latestCommit.sha);
    }

    return NextResponse.json({
      message: 'Push successful',
      commitsCreated: createdCommits.length,
      commits: createdCommits,
      repository: {
        id: repository.id,
        name: repository.name
      }
    });

  } catch (error) {
    console.error('Error in test push:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}