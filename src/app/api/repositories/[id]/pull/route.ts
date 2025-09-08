import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { branch = 'main', currentCommit, userEmail } = await request.json();
    const { id } = await params;

    console.log('Pull endpoint called for:', id, 'branch:', branch, 'currentCommit:', currentCommit, 'by user:', userEmail);

    if (!id) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required for authentication' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: `User not found with email: ${userEmail}` }, { status: 404 });
    }

    // Parse repository ID - it can be either a direct ID or username/reponame format
    let repository;
    if (id.includes('/')) {
      // Format: username/reponame
      const [username, reponame] = id.split('/').map(decodeURIComponent);
      
      console.log(`Looking for repository '${reponame}' owned by authenticated user: ${user.email}`);

      repository = await prisma.repository.findFirst({
        where: {
          name: reponame,
          ownerId: user.id,
        },
        include: {
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
    } else {
      // Direct repository ID
      repository = await prisma.repository.findFirst({
        where: {
          id,
          ownerId: user.id
        },
        include: {
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

    // Find the requested branch
    const targetBranch = repository.branches.find(b => b.name === branch);
    if (!targetBranch) {
      return NextResponse.json({ error: `Branch '${branch}' not found` }, { status: 404 });
    }

    const remoteHeadCommit = targetBranch.commitSha;

    // If no current commit (first pull) or different from remote head, fetch new commits
    if (!currentCommit || currentCommit !== remoteHeadCommit) {
      // Find commits that the local repository doesn't have yet
      let newCommits = [];
      
      if (!currentCommit) {
        // First pull - get all commits
        newCommits = repository.commits;
      } else {
        // Find commits newer than the current local commit
        const currentCommitIndex = repository.commits.findIndex(c => c.sha === currentCommit);
        if (currentCommitIndex === -1) {
          // Current commit not found in remote - this might be a divergence
          // For now, just return all commits (could be enhanced to handle merges)
          newCommits = repository.commits;
        } else {
          // Get commits after the current one
          newCommits = repository.commits.slice(currentCommitIndex + 1);
        }
      }

      if (newCommits.length === 0) {
        return NextResponse.json({
          hasNewCommits: false,
          newCommitsCount: 0,
          commits: [],
          headCommit: remoteHeadCommit
        });
      }

      // Format new commits for the response
      const formattedCommits = newCommits.map(commit => ({
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
      }));

      return NextResponse.json({
        hasNewCommits: true,
        newCommitsCount: newCommits.length,
        commits: formattedCommits,
        headCommit: remoteHeadCommit
      });
    } else {
      // Already up to date
      return NextResponse.json({
        hasNewCommits: false,
        newCommitsCount: 0,
        commits: [],
        headCommit: remoteHeadCommit
      });
    }

  } catch (error) {
    console.error('Error in pull endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}