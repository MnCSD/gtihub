import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/test-clone - Test endpoint for cloning without authentication
export async function POST(request: NextRequest) {
  try {
    const { repositoryId, userEmail = 'mnikolopoylos@gmail.com' } = await request.json();

    console.log('Test clone endpoint called for:', repositoryId);

    if (!repositoryId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: `User not found with email: ${userEmail}` }, { status: 404 });
    }

    // Find repository by name and owner
    const repository = await prisma.repository.findFirst({
      where: {
        name: repositoryId,
        ownerId: user.id
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        branches: true,
        commits: {
          include: {
            files: true
          },
          orderBy: {
            timestamp: 'asc' // Oldest first for proper recreation
          }
        }
      }
    });

    if (!repository) {
      return NextResponse.json({ error: `Repository '${repositoryId}' not found for user ${userEmail}` }, { status: 404 });
    }

    console.log(`Found repository: ${repository.name} with ${repository.commits.length} commits`);

    // Get the main branch reference
    const mainBranch = repository.branches.find(branch => branch.name === 'main') || repository.branches[0];

    // Format response for cloning
    const cloneData = {
      repository: {
        id: repository.id,
        name: repository.name,
        description: repository.description,
        owner: repository.owner,
        createdAt: repository.createdAt,
        updatedAt: repository.updatedAt
      },
      branches: repository.branches.map(branch => ({
        name: branch.name,
        commitSha: branch.commitSha,
        createdAt: branch.createdAt
      })),
      commits: repository.commits.map(commit => ({
        sha: commit.sha,
        message: commit.message,
        author: {
          name: commit.authorName,
          email: commit.authorEmail
        },
        committer: {
          name: commit.committerName,
          email: commit.committerEmail
        },
        timestamp: commit.timestamp.toISOString(),
        treeHash: commit.treeHash,
        parentSha: commit.parentSha,
        files: commit.files.map(file => ({
          path: file.path,
          content: file.content,
          hash: file.hash,
          mode: file.mode,
          action: file.action
        }))
      })),
      defaultBranch: mainBranch ? mainBranch.name : 'main',
      headCommit: mainBranch ? mainBranch.commitSha : null
    };

    console.log('Returning clone data with', cloneData.commits.length, 'commits');

    return NextResponse.json(cloneData);

  } catch (error) {
    console.error('Error in test clone endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}