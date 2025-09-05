export interface Repository {
    id: string;
    name: string;
    description?: string;
    owner: string;
    private: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Commit {
    hash: string;
    message: string;
    author: string;
    committer: string;
    timestamp: Date;
    repositoryId: string;
    parentCommits?: string[];
}
export interface FileEntry {
    path: string;
    content: string;
    size: number;
    commitHash: string;
    type: 'blob' | 'tree';
    hash: string;
}
export interface Branch {
    name: string;
    repositoryId: string;
    lastCommitHash: string;
}
export interface GitConfig {
    user: {
        name: string;
        email: string;
    };
    remote: {
        origin: string;
    };
    auth: {
        token?: string;
    };
}
export interface LocalState {
    repositoryId: string;
    currentBranch: string;
    stagedFiles: string[];
    lastCommitHash?: string;
    remoteUrl: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map