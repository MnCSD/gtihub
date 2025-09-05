import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getGithUser } from "@/lib/gith-config";

// GET /api/repositories/[id]/status - Get repository status
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
      include: {
        branches: {
          orderBy: {
            name: "asc",
          },
        },
        commits: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    const mainBranch = repository.branches.find(
      (branch) => branch.name === "main"
    );
    const latestCommit = repository.commits[0];

    return NextResponse.json({
      id: repository.id,
      name: repository.name,
      description: repository.description,
      isPrivate: repository.isPrivate,
      branches: repository.branches,
      currentBranch: mainBranch?.name || "main",
      latestCommit: latestCommit
        ? {
            sha: latestCommit.sha,
            message: latestCommit.message,
            author: {
              name: latestCommit.authorName,
              email: latestCommit.authorEmail,
            },
            timestamp: latestCommit.timestamp,
          }
        : null,
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching repository status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
