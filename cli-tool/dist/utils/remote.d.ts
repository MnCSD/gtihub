export interface RemoteConfig {
    name: string;
    url: string;
    repositoryId?: string;
}
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