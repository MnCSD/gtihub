import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

// POST /api/repositories/[id]/upload - Handle file upload and commit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    
    // Extract commit data
    const title = formData.get("title") as string || "Add files via upload";
    const description = formData.get("description") as string || "";
    const branch = formData.get("dest") === "new-branch" ? `upload-${nanoid(8)}` : "main";
    
    // Extract files
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse repository ID - it can be either a direct ID or username/reponame format
    let repository;
    if (id.includes("/")) {
      // Format: username/reponame
      const [, reponame] = id.split("/").map(decodeURIComponent);

      // Use the authenticated user as the owner (ignore username from URL)
      repository = await prisma.repository.findFirst({
        where: {
          name: reponame,
          ownerId: user.id,
        },
      });

      if (!repository) {
        repository = await prisma.repository.create({
          data: {
            name: reponame,
            description: `Repository created via upload`,
            ownerId: user.id,
          },
        });

        // Create default main branch
        await prisma.branch.create({
          data: {
            name: "main",
            repositoryId: repository.id,
          },
        });
      }
    } else {
      // Direct repository ID
      repository = await prisma.repository.findFirst({
        where: {
          id,
          ownerId: user.id,
        },
      });
    }

    if (!repository) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Get the latest commit from the target branch for parent reference
    const latestBranch = await prisma.branch.findUnique({
      where: {
        repositoryId_name: {
          repositoryId: repository.id,
          name: branch === "main" ? "main" : "main", // Always base on main for now
        },
      },
    });

    // Read file contents and prepare commit data
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const content = new TextDecoder().decode(arrayBuffer);
        const hash = nanoid(); // Simple hash for now
        
        return {
          path: file.name,
          content,
          hash,
          mode: "100644",
          action: "added" as const,
        };
      })
    );

    // Create commit
    const commitSha = nanoid();
    const timestamp = new Date();
    const commitMessage = description ? `${title}\n\n${description}` : title;

    const commit = await prisma.commit.create({
      data: {
        sha: commitSha,
        message: commitMessage,
        authorName: user.name || user.email!,
        authorEmail: user.email!,
        committerName: user.name || user.email!,
        committerEmail: user.email!,
        timestamp,
        treeHash: nanoid(),
        parentSha: latestBranch?.commitSha || null,
        repositoryId: repository.id,
      },
    });

    // Create commit files
    await Promise.all(
      fileContents.map((file) =>
        prisma.commitFile.create({
          data: {
            commitId: commit.id,
            path: file.path,
            content: file.content,
            hash: file.hash,
            mode: file.mode,
            action: file.action,
          },
        })
      )
    );

    // Update branch reference
    await prisma.branch.upsert({
      where: {
        repositoryId_name: {
          repositoryId: repository.id,
          name: branch,
        },
      },
      update: {
        commitSha: commit.sha,
      },
      create: {
        name: branch,
        repositoryId: repository.id,
        commitSha: commit.sha,
      },
    });

    // Update repository
    await prisma.repository.update({
      where: { id: repository.id },
      data: { updatedAt: timestamp },
    });

    return NextResponse.json({
      success: true,
      commit: {
        sha: commit.sha,
        message: commit.message,
      },
      branch,
      filesUploaded: files.length,
    });

  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}