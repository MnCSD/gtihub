import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/dashboard/navbar";
import { NavigationTabs, NavigationTab } from "@/components/features/repository";
import { CodeIcon } from "lucide-react";

type LayoutParams = {
  params: Promise<{ username: string; repo: string }>;
  children: React.ReactNode;
};

// Navigation tabs configuration
const navigationTabs: NavigationTab[] = [
  { label: "Code", icon: <CodeIcon size={16} />, active: true },
  { label: "Issues", icon: "⚠", count: null },
];

export default async function RepositoryLayout({ params, children }: LayoutParams) {
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar user={navUser} repositoryInfo={repoDisplayInfo} />
      
      {/* Navigation tabs */}
      <NavigationTabs tabs={navigationTabs} />
      
      {/* Page content */}
      {children}
    </div>
  );
}