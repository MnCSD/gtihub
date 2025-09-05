import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/repositories/[id]/clone - Get repository data for cloning
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = params;

    // Get repository with all data needed for cloning
    const repository = await prisma.repository.findFirst({
      where: {
        id,
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
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

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

    return NextResponse.json(cloneData);

  } catch (error) {
    console.error('Error preparing repository for clone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// For cloning with user email from CLI config  
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userEmail = 'mnikolopoylos@gmail.com' } = await request.json();
    const { id } = params;

    console.log('Clone endpoint called for:', id, 'by user:', userEmail);

    if (!id) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: `User not found with email: ${userEmail}` }, { status: 404 });
    }

    // Find repository by ID and check ownership
    const repository = await prisma.repository.findFirst({
      where: {
        id: id,
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
            timestamp: 'asc'
          }
        }
      }
    });

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

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

    return NextResponse.json(cloneData);

  } catch (error) {
    console.error('Error in clone endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}