// User and Authentication Types
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
}

export interface GithUser {
  name?: string;
  email?: string;
}

// Repository Types
export interface Repository {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    name: string | null;
    email: string;
  };
  _count?: {
    commits: number;
  };
}

export interface UserRepository {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  commitCount: number;
  lastCommit: {
    message: string;
    timestamp: Date;
    authorName: string;
  } | null;
}

export interface RepositoryCreateData {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

// Git/Commit Types
export interface GitAuthor {
  name: string;
  email: string;
}

export interface CommitFile {
  path: string;
  content: string;
  hash: string;
  mode: string;
  action: 'added' | 'modified' | 'deleted';
}

export interface Commit {
  sha: string;
  message: string;
  author: GitAuthor;
  committer: GitAuthor;
  timestamp: string;
  treeHash: string;
  parentSha: string | null;
  files: CommitFile[];
}

export interface Branch {
  name: string;
  commitSha: string | null;
  createdAt: string;
}

// Clone/Repository Data Types
export interface CloneData {
  repository: {
    id: string;
    name: string;
    description: string | null;
    owner: {
      name: string | null;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  branches: Branch[];
  commits: Commit[];
  defaultBranch: string;
  headCommit: string | null;
}

// Component Props Types
export interface RepoCardProps {
  name: string;
  description?: string;
  language?: string;
  stars?: string | number;
  rightAction?: React.ReactNode;
  compact?: boolean;
}

export interface NavUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface SidebarProps {
  owner: string;
  ownerImage?: string | null;
}

export interface UserMenuProps {
  user: NavUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name?: string;
  email: string;
  password: string;
}

// Utility Types
export interface LanguageMeta {
  color: string | null;
  url?: string | null;
}

export type LanguageColors = Record<string, LanguageMeta>;

// Menu Item Types
export interface MenuItemProps {
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
  href?: string;
  badge?: string;
}