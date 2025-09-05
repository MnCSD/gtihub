import { GitConfig } from '../types';
export declare function ensureConfigDir(): void;
export declare function getConfig(): GitConfig;
export declare function setConfig(config: Partial<GitConfig>): void;
export declare function setConfigValue(key: string, value: any): void;
export declare function getConfigValue(key: string): any;
//# sourceMappingURL=config.d.ts.map