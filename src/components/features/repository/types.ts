export interface RepositoryInfo {
  username: string;
  repo: string;
  isPrivate?: boolean;
  description?: string | null;
  branchesCount?: number;
}

export interface User {
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface CommitInfo {
  message: string;
  timestamp: Date;
  authorName: string;
  sha: string;
}

export interface FileItem {
  name: string;
  type: "dir" | "file";
  commit: string;
  updated: string;
}

export interface NavigationTab {
  label: string;
  icon: React.ReactNode | string;
  active?: boolean;
  count?: number | null;
}

export interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
  fileCount?: number;
  totalLines?: number;
}

export interface RepositoryStats {
  stars: number;
  watchers: number;
  forks: number;
}