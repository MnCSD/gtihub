import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's repositories with recent commit info
    const repositories = await prisma.repository.findMany({
      where: { ownerId: user.id },
      include: {
        commits: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        _count: {
          select: { commits: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format the response
    const formattedRepos = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      isPrivate: repo.isPrivate,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      commitCount: repo._count.commits,
      lastCommit: repo.commits[0] ? {
        message: repo.commits[0].message,
        timestamp: repo.commits[0].timestamp,
        authorName: repo.commits[0].authorName,
      } : null,
    }));

    return NextResponse.json({ repositories: formattedRepos });
  } catch (error) {
    console.error("Error fetching user repositories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}