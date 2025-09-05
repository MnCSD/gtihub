import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getGithUser } from "@/lib/gith-config";

// GET /api/repositories/[id]/commits - Get commits for a repository
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const githUser = await getGithUser();

    if (!githUser?.email) {
      return NextResponse.json({ error: "No user configured in gith config. Run: gith config user.email <email>" }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: githUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify repository access
    const repository = await prisma.repository.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    const commits = await prisma.commit.findMany({
      where: {
        repositoryId: id,
      },
      include: {
        files: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(commits);
  } catch (error) {
    console.error("Error fetching commits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/repositories/[id]/commits - Create new commits (for push)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const githUser = await getGithUser();

    if (!githUser?.email) {
      return NextResponse.json({ error: "No user configured in gith config. Run: gith config user.email <email>" }, { status: 401 });
    }

    // Get user by email to get the ID
    const user = await prisma.user.findUnique({
      where: { email: githUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const { commits: commitsData, branch = "main" } = await request.json();

    // Verify repository access
    const repository = await prisma.repository.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    if (!commitsData || !Array.isArray(commitsData)) {
      return NextResponse.json(
        { error: "Invalid commits data" },
        { status: 400 }
      );
    }

    const createdCommits = [];

    // Process commits in order (oldest first for proper parent relationships)
    for (const commitData of commitsData) {
      const {
        sha,
        message,
        author,
        committer,
        timestamp,
        treeHash,
        parentSha,
        files,
      } = commitData;

      // Check if commit already exists
      const existingCommit = await prisma.commit.findUnique({
        where: { sha },
      });

      if (existingCommit) {
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
          repositoryId: id,
        },
      });

      // Create commit files
      if (files && Array.isArray(files)) {
        await prisma.commitFile.createMany({
          data: files.map((file: any) => ({
            commitId: commit.id,
            path: file.path,
            content: file.content,
            hash: file.hash,
            mode: file.mode || "100644",
            action: file.action || "added",
          })),
        });
      }

      createdCommits.push(commit);
    }

    // Update branch reference if commits were created
    if (createdCommits.length > 0) {
      const latestCommit = createdCommits[createdCommits.length - 1];

      await prisma.branch.upsert({
        where: {
          repositoryId_name: {
            repositoryId: id,
            name: branch,
          },
        },
        update: {
          commitSha: latestCommit.sha,
        },
        create: {
          name: branch,
          repositoryId: id,
          commitSha: latestCommit.sha,
        },
      });

      // Update repository updatedAt
      await prisma.repository.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      message: "Push successful",
      commitsCreated: createdCommits.length,
      commits: createdCommits,
    });
  } catch (error) {
    console.error("Error creating commits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
