export interface RemoteConfig {
    name: string;
    url: string;
    repositoryId?: string;
    username?: string;
    repoName?: string;
}
/**
 * Parse a web URL to extract username and repository name
 * Format: https://localhost:3000/{username}/{reponame}
 */
export declare function parseWebUrl(url: string): {
    username: string;
    repoName: string;
    baseUrl: string;
} | null;
/**
 * Convert web URL to API endpoint URL
 */
export declare function getApiUrl(webUrl: string): string;
/**
 * Get the remote configuration from the local .gith/config
 */
export declare function getRemoteConfig(remoteName?: string): Promise<RemoteConfig | null>;
/**
 * Add or update a remote configuration
 */
export declare function setRemoteConfig(remoteName: string, url: string, repositoryId?: string): Promise<void>;
/**
 * Remove a remote configuration
 */
export declare function removeRemoteConfig(remoteName: string): Promise<void>;
//# sourceMappingURL=remote.d.ts.map