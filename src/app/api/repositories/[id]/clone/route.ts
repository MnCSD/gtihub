import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGithUser } from '@/lib/gith-config';

// GET /api/repositories/[id]/clone - Get repository data for cloning
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const githUser = await getGithUser();
    
    if (!githUser?.email) {
      return NextResponse.json({ error: 'No user configured in gith config. Run: gith config user.email <email>' }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: githUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

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

// For public repositories or when authentication is not required
export async function POST(request: NextRequest) {
  try {
    const { repositoryId, userEmail } = await request.json();

    if (!repositoryId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Find repository by name and owner email (for public access)
    let repository;
    
    if (userEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (owner) {
        repository = await prisma.repository.findFirst({
          where: {
            name: repositoryId,
            ownerId: owner.id
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
      }
    } else {
      // Try to find by repository ID directly
      repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId
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
    }

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