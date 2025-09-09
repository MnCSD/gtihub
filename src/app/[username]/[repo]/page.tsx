import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/dashboard/navbar";
import UserAvatar from "@/components/ui/user-avatar";
import Link from "next/link";
import {
  ChevronDown,
  ChevronDownIcon,
  Code,
  CodeIcon,
  LucideClockFading,
  PinIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";
import { Metadata } from "next";

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

  // Try to locate the repository for the signed-in user
  let dbRepo: any = null;
  let branchesCount = 0;
  let latestCommit: {
    message: string;
    timestamp: Date;
    authorName: string;
  } | null = null;

  if (session?.user?.email) {
    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (owner) {
      const repoData = await prisma.repository.findFirst({
        where: { ownerId: owner.id, name: repo },
        include: {
          branches: true,
          commits: { orderBy: { timestamp: "desc" }, take: 1 },
        },
      });
      if (repoData) {
        dbRepo = repoData as any;
        branchesCount = repoData.branches.length;
        if (repoData.commits[0]) {
          latestCommit = {
            message: repoData.commits[0].message,
            timestamp: repoData.commits[0].timestamp,
            authorName: repoData.commits[0].authorName,
          };
        }
      }
    }
  }

  const isPrivate = dbRepo?.isPrivate ?? false;
  const description = dbRepo?.description ?? null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar user={navUser} repositoryInfo={repoDisplayInfo} />

      {/* Navigation tabs - full width, right below navbar */}
      <div className="border-b border-white/20 bg-[#010409]">
        <div className="w-full px-4 py-0 sm:px-6 lg:px-4">
          <nav className="flex gap-8 text-sm mx-auto">
            {[
              { label: "Code", icon: <CodeIcon size={16} />, active: true },
              { label: "Issues", icon: "⚠", count: null },
            ].map((tab) => (
              <div
                key={tab.label}
                className={`flex items-center gap-2 py-4 border-b-2 whitespace-nowrap ${
                  tab.active
                    ? "text-white border-[#fd7e14]"
                    : "text-white/70 border-transparent hover:text-white hover:border-white/20"
                }`}
              >
                <span className="text-xs opacity-70">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Repo header section */}
      <div
        className="max-w-[1260px] mx-auto px-4 py-4 border-b 
      border-white/20 mb-6
      "
      >
        <div className="flex items-start justify-between gap-6">
          {/* Left: Repo info */}
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={navUser} size={28} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xl font-semibold">
                <span className="font-semibold">{repo}</span>
                <span className="ml-3 text-xs border border-white/30 rounded-full px-2 py-1 text-white/80 font-normal">
                  {isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
              <span>
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  data-view-component="true"
                  fill="gray"
                >
                  <path d="m11.294.984 3.722 3.722a1.75 1.75 0 0 1-.504 2.826l-1.327.613a3.089 3.089 0 0 0-1.707 2.084l-.584 2.454c-.317 1.332-1.972 1.8-2.94.832L5.75 11.311 1.78 15.28a.749.749 0 1 1-1.06-1.06l3.969-3.97-2.204-2.204c-.968-.968-.5-2.623.832-2.94l2.454-.584a3.08 3.08 0 0 0 2.084-1.707l.613-1.327a1.75 1.75 0 0 1 2.826-.504ZM6.283 9.723l2.732 2.731a.25.25 0 0 0 .42-.119l.584-2.454a4.586 4.586 0 0 1 2.537-3.098l1.328-.613a.25.25 0 0 0 .072-.404l-3.722-3.722a.25.25 0 0 0-.404.072l-.613 1.328a4.584 4.584 0 0 1-3.098 2.537l-2.454.584a.25.25 0 0 0-.119.42l2.731 2.732Z"></path>
                </svg>
              </span>
              <span>Pin</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
              <span>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="gray"
                  display="inline-block"
                  overflow="visible"
                >
                  <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path>
                </svg>
              </span>
              <span>Watch</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
                0
              </span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
              <span>
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  data-view-component="true"
                  fill="gray"
                >
                  <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
                </svg>
              </span>
              <span>Fork</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
                0
              </span>
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
              <span>
                <StarIcon size={16} color="gray" />
              </span>
              <span>Star</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-[1260px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: file browser */}
        <div>
          {/* File browser header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
                <span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="gray"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
                  </svg>
                </span>
                <span>main</span>
                <span className="text-xs">
                  <ChevronDownIcon size={14} />
                </span>
              </button>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="gray"
                    display="inline-block"
                    overflow="visible"
                  >
                    <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
                  </svg>
                  <span>
                    <span className="text-white">{branchesCount} </span>
                    Branches
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <TagIcon size={14} />
                  <span>
                    <span className="text-white">0 </span>
                    Tags
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="Go to file"
                className="h-8 w-64 rounded-md bg-transparent border border-white/30 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:border-[#58a6ff]"
              />
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-md bg-white/10">
                <span>Add file</span>
                <span className="text-xs">
                  <ChevronDownIcon size={14} />
                </span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#238636] hover:bg-[#2ea043] rounded-md">
                <span>
                  <CodeIcon size={16} color="white" />
                </span>
                <span>Code</span>
                <span className="text-xs">
                  <ChevronDownIcon size={14} />
                </span>
              </button>
            </div>
          </div>

          {/* Commit info bar */}
          <div className="flex items-center gap-3 p-4 bg-[#151B23] border border-white/20 rounded-t-md">
            <UserAvatar user={navUser} size={20} />
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center">
                <div className=" text-white">
                  <span className="font-medium">
                    {latestCommit?.authorName || username}
                  </span>
                </div>
                <Link
                  href="#"
                  className="text-white/60 hover:underline text-sm"
                >
                  Merge pull request
                  <span
                    className="
                  text-[#58a6ff]"
                  >
                    #17
                  </span>
                  from {username}/18-bug-fixes
                </Link>
              </div>
            </div>
            <div className="text-xs text-white/60">
              <span>4b2b5d6 • 3 months ago</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span>
                <LucideClockFading size={20} color={"gray"} />
              </span>
              <span>37 Commits</span>
            </div>
          </div>

          {/* File list */}
          <div className="border border-white/20 rounded-md overflow-hidden">
            {[
              {
                name: "prisma",
                type: "dir",
                commit: "17:billing",
                updated: "3 months ago",
              },
              {
                name: "public",
                type: "dir",
                commit: "15: theme",
                updated: "3 months ago",
              },
              {
                name: "sandbox-templates/nextjs",
                type: "dir",
                commit: "06: e2b-sandbox",
                updated: "3 months ago",
              },
              {
                name: "src",
                type: "dir",
                commit: "18: bug-fixes",
                updated: "3 months ago",
              },
              {
                name: ".gitignore",
                type: "file",
                commit: "02: database",
                updated: "3 months ago",
              },
              {
                name: "README.md",
                type: "file",
                commit: "Initial commit from Create Next App",
                updated: "3 months ago",
              },
              {
                name: "components.json",
                type: "file",
                commit: "01:setup",
                updated: "3 months ago",
              },
              {
                name: "eslint.config.mjs",
                type: "file",
                commit: "Initial commit from Create Next App",
                updated: "3 months ago",
              },
              {
                name: "next.config.ts",
                type: "file",
                commit: "Initial commit from Create Next App",
                updated: "3 months ago",
              },
              {
                name: "package-lock.json",
                type: "file",
                commit: "18: bug-fixes",
                updated: "3 months ago",
              },
              {
                name: "package.json",
                type: "file",
                commit: "18: bug-fixes",
                updated: "3 months ago",
              },
              {
                name: "postcss.config.mjs",
                type: "file",
                commit: "Initial commit from Create Next App",
                updated: "3 months ago",
              },
              {
                name: "tsconfig.json",
                type: "file",
                commit: "Initial commit from Create Next App",
                updated: "3 months ago",
              },
            ].map((item, index) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 p-3 py-2 hover:bg-white/[0.03] ${
                  index > 0 ? "border-t border-white/20" : ""
                }`}
              >
                <span className="w-4 text-center text-white/60">
                  {item.type === "dir" ? "📁" : "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href="#"
                    className="text-[#58a6ff] hover:underline text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                </div>
                <div className="text-sm text-white/60 min-w-0 max-w-[200px] truncate">
                  <Link href="#" className="hover:underline">
                    {item.commit}
                  </Link>
                </div>
                <div className="text-xs text-white/60 w-24 text-right">
                  {item.updated}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold">About</h2>
              <button className="text-white/60 hover:text-white">⚙️</button>
            </div>
            <p className="text-sm text-white/60 mb-4 italic">
              {description || "No description, website, or topics provided."}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span>📖</span>
                <Link
                  href="#"
                  className="text-[#58a6ff] hover:underline text-sm"
                >
                  Readme
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <span>📊</span>
                <Link
                  href="#"
                  className="text-[#58a6ff] hover:underline text-sm"
                >
                  Activity
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>0 stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👀</span>
                  <span>0 watching</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔀</span>
                  <span>0 forks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Releases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Releases</h3>
            </div>
            <p className="text-sm text-white/60 mb-2">No releases published</p>
            <Link href="#" className="text-[#58a6ff] hover:underline text-sm">
              Create a new release
            </Link>
          </div>

          {/* Packages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Packages</h3>
            </div>
            <p className="text-sm text-white/60 mb-2">No packages published</p>
            <Link href="#" className="text-[#58a6ff] hover:underline text-sm">
              Publish your first package
            </Link>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold mb-3">Languages</h3>
            <div className="space-y-2">
              <div className="h-2 w-full rounded overflow-hidden bg-white/10">
                <div className="h-full flex">
                  <div
                    className="bg-[#3178c6]"
                    style={{ width: "95.2%" }}
                  ></div>
                  <div className="bg-[#563d7c]" style={{ width: "4.2%" }}></div>
                  <div className="bg-[#f1e05a]" style={{ width: "0.6%" }}></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#3178c6]"></div>
                  <span>TypeScript 95.2%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#563d7c]"></div>
                  <span>CSS 4.2%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#f1e05a]"></div>
                  <span>Other 0.6%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested workflows */}
          <div>
            <h3 className="font-semibold mb-3">Suggested workflows</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#21262d] border border-white/10 rounded flex items-center justify-center">
                  ⚛️
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Deploy Next.js to Pages
                  </h4>
                  <p className="text-xs text-white/60 mb-2">
                    Build and deploy a Next.js site to GitHub Pages
                  </p>
                  <button className="text-xs bg-[#238636] hover:bg-[#2ea043] px-3 py-1.5 rounded">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
