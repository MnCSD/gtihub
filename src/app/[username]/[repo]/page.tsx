import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/dashboard/navbar";
import { CodeIcon } from "lucide-react";
import { Metadata } from "next";
import {
  NavigationTabs,
  RepositoryHeader,
  FileBrowser,
  ReadmeSection,
  RepositorySidebar,
  FileItem,
  NavigationTab,
} from "@/components/features/repository";

type PageParams = {
  params: Promise<{ username: string; repo: string }>;
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { username, repo } = await params;

  return {
    title: `${username}/${repo}`,
    description: `${username}/${repo} repository`,
  };
}

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}


// Navigation tabs configuration
const navigationTabs: NavigationTab[] = [
  { label: "Code", icon: <CodeIcon size={16} />, active: true },
  { label: "Issues", icon: "⚠", count: null },
];

export default async function RepositoryPage({ params }: PageParams) {
  const { username, repo } = await params;

  const session = await getServerSession(authOptions);
  const navUser = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
  };

  // Create repository display info for navbar
  const repoDisplayInfo = {
    username,
    repo,
    displayText: `${username}/${repo}`,
  };

  // Try to locate the repository for the specified username
  let dbRepo: {
    isPrivate?: boolean;
    description?: string | null;
    branches: Array<{ id: string; name: string }>;
    commits: Array<{
      message: string;
      timestamp: Date;
      authorName: string;
      sha: string;
      files?: Array<{
        path: string;
        content: string;
        action: string;
      }>;
    }>;
  } | null = null;
  let branchesCount = 0;
  let commitsCount = 0;
  let latestCommit: {
    message: string;
    timestamp: Date;
    authorName: string;
    sha: string;
  } | null = null;
  let repoFiles: Array<{
    name: string;
    type: "file" | "dir";
    path: string;
    lastCommitMessage?: string;
    lastCommitDate?: Date;
  }> = [];
  let readmeContent = "";
  let currentFiles = new Map<string, {
    path: string;
    content: string;
    action: string;
    lastCommitMessage: string;
    lastCommitDate: Date;
  }>();

  // Find the repository owner by username (could be name or part of email)
  const repoOwner = await prisma.user.findFirst({
    where: { 
      OR: [
        { name: { equals: username, mode: 'insensitive' } },
        { email: { contains: username, mode: 'insensitive' } }
      ]
    },
  });

  if (repoOwner) {
    const [repoData, totalCommits] = await Promise.all([
      prisma.repository.findFirst({
        where: { ownerId: repoOwner.id, name: repo },
        include: {
          branches: true,
          commits: { 
            orderBy: { timestamp: "desc" }, 
            take: 1,
            include: {
              files: true
            }
          },
        },
      }),
      prisma.commit.count({
        where: {
          repository: {
            ownerId: repoOwner.id,
            name: repo
          }
        }
      })
    ]);
    
    if (repoData) {
      dbRepo = repoData;
      branchesCount = repoData.branches.length;
      commitsCount = totalCommits;
      
      if (repoData.commits[0]) {
        latestCommit = {
          message: repoData.commits[0].message,
          timestamp: repoData.commits[0].timestamp,
          authorName: repoData.commits[0].authorName,
          sha: repoData.commits[0].sha,
        };

        // Get the latest version of each file using a more robust approach
        const allCommitFiles = await prisma.$queryRaw<Array<{
          path: string;
          content: string;
          action: string;
          message: string;
          timestamp: Date;
        }>>`
          SELECT DISTINCT ON (cf.path) 
            cf.path,
            cf.content,
            cf.action,
            c.message,
            c.timestamp
          FROM "CommitFile" cf
          INNER JOIN "Commit" c ON c.id = cf."commitId"
          WHERE c."repositoryId" = ${repoData.id}
          ORDER BY cf.path, c.timestamp DESC
        `;

        // Build current repository state (latest version of each file)
        currentFiles.clear(); // Clear any existing data

        // Process files - each is already the latest version due to DISTINCT ON query
        allCommitFiles.forEach(file => {
          currentFiles.set(file.path, {
            path: file.path,
            content: file.content,
            action: file.action,
            lastCommitMessage: file.message,
            lastCommitDate: file.timestamp,
          });
        });
        
        // Debug: Log current files for analysis
        console.log('Current files for language analysis:', 
          Array.from(currentFiles.values()).map(f => ({ 
            path: f.path, 
            action: f.action,
            contentLength: f.content?.length || 0,
            lines: f.content?.split('\n').length || 0
          }))
        );
        
        // Process files to create directory structure for root level display
        const fileMap = new Map<string, {
          name: string;
          type: "file" | "dir";
          path: string;
          lastCommitMessage?: string;
          lastCommitDate?: Date;
        }>();

        currentFiles.forEach(file => {
          if (file.action !== "deleted") {
            const pathParts = file.path.split('/');
            
            if (pathParts.length === 1) {
              // Root level file
              fileMap.set(file.path, {
                name: pathParts[0],
                type: "file",
                path: file.path,
                lastCommitMessage: file.lastCommitMessage,
                lastCommitDate: file.lastCommitDate,
              });
            } else {
              // File in subdirectory - add the top-level directory
              const topDirName = pathParts[0];
              if (!fileMap.has(topDirName)) {
                fileMap.set(topDirName, {
                  name: topDirName,
                  type: "dir",
                  path: topDirName,
                  lastCommitMessage: file.lastCommitMessage,
                  lastCommitDate: file.lastCommitDate,
                });
              }
            }
          }
        });

        // Convert to array and sort (directories first, then files)
        repoFiles = Array.from(fileMap.values())
          .sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name);
            }
            return a.type === "dir" ? -1 : 1;
          });

        // Find README content from current files
        const readmeFile = Array.from(currentFiles.values()).find(file => 
          file.path.toLowerCase() === 'readme.md' && file.action !== "deleted"
        );
        if (readmeFile) {
          readmeContent = readmeFile.content;
        } else {
          // Fallback to default content if no README found
          readmeContent = `# ${repo}

This repository doesn't have a README.md file yet.

## Getting Started

Welcome to ${repo}! This project is managed using our custom Git implementation.

## Contributing

Feel free to contribute to this project by submitting pull requests.`;
        }
      }
    }
  }

  // Repository data preparation
  const repositoryInfo = {
    username,
    repo,
    isPrivate: dbRepo?.isPrivate ?? false,
    description: dbRepo?.description ?? null,
    branchesCount,
  };


  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar user={navUser} repositoryInfo={repoDisplayInfo} />

      {/* Navigation tabs */}
      <NavigationTabs tabs={navigationTabs} />

      {/* Repository header */}
      <RepositoryHeader repository={repositoryInfo} user={navUser} />

      {/* Content area */}
      <div className="max-w-[1260px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: file browser and README */}
        <div>
          <FileBrowser 
            user={navUser}
            username={username}
            commit={latestCommit}
            files={repoFiles.map(file => ({
              name: file.name,
              type: file.type,
              commit: file.lastCommitMessage || "Initial commit",
              updated: file.lastCommitDate ? formatRelative(file.lastCommitDate) : "unknown"
            }))}
            branchesCount={branchesCount}
            commitsCount={commitsCount}
          />
          
          <ReadmeSection content={readmeContent} />
        </div>

        {/* Right sidebar */}
        <RepositorySidebar 
          description={repositoryInfo.description}
          repositoryFiles={Array.from(currentFiles?.values() || [])
            .filter(file => file.action !== 'deleted')
            .map(file => ({
              path: file.path,
              content: file.content,
              action: file.action
            }))}
        />
      </div>
    </div>
  );
}
