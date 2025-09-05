import { ApiResponse, Repository, Commit, FileEntry, Branch } from '../types';
declare class ApiClient {
    private client;
    constructor();
    getRepository(owner: string, repo: string): Promise<ApiResponse<Repository>>;
    createRepository(data: Partial<Repository>): Promise<ApiResponse<Repository>>;
    cloneRepository(owner: string, repo: string): Promise<ApiResponse<{
        repository: Repository;
        files: FileEntry[];
    }>>;
    createCommit(owner: string, repo: string, commitData: {
        message: string;
        files: {
            path: string;
            content: string;
        }[];
        branch: string;
    }): Promise<ApiResponse<Commit>>;
    pushCommits(owner: string, repo: string, pushData: {
        commits: string[];
        branch: string;
    }): Promise<ApiResponse<{
        success: boolean;
    }>>;
    getFiles(owner: string, repo: string, branch?: string): Promise<ApiResponse<FileEntry[]>>;
    getBranches(owner: string, repo: string): Promise<ApiResponse<Branch[]>>;
}
export declare const apiClient: ApiClient;
export {};
//# sourceMappingURL=api.d.ts.map