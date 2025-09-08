import { promises as fs } from 'fs';
import * as path from 'path';

interface GithConfig {
  'user.name'?: string;
  'user.email'?: string;
  [key: string]: string | undefined;
}

/**
 * Read gith configuration from local and global config files
 */
export async function getGithConfig(): Promise<GithConfig> {
  const config: GithConfig = {};
  
  try {
    // First, read global config
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const globalConfigFile = path.join(homeDir, '.githconfig');
    
    try {
      await fs.access(globalConfigFile);
      const globalConfig = await parseConfigFile(globalConfigFile);
      Object.assign(config, globalConfig);
    } catch {
      // Global config file doesn't exist, skip
    }
    
    // Then, read local config (if in a gith repository)
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    
    try {
      await fs.access(githDir);
      const localConfigFile = path.join(githDir, 'config');
      
      try {
        await fs.access(localConfigFile);
        const localConfig = await parseConfigFile(localConfigFile);
        // Local config overrides global config
        Object.assign(config, localConfig);
      } catch {
        // Local config file doesn't exist, skip
      }
    } catch {
      // Not in a gith repository, skip local config
    }
    
    return config;
  } catch (error) {
    console.error('Error reading gith config:', error);
    return {};
  }
}

/**
 * Parse a gith config file (INI-like format)
 */
async function parseConfigFile(configFile: string): Promise<GithConfig> {
  const config: GithConfig = {};
  
  try {
    const configContent = await fs.readFile(configFile, 'utf-8');
    const lines = configContent.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Section header
        currentSection = trimmed.slice(1, -1);
      } else if (trimmed.includes('=')) {
        // Key-value pair
        const [key, value] = trimmed.split('=').map(s => s.trim());
        const fullKey = currentSection ? `${currentSection}.${key}` : key;
        config[fullKey] = value;
      }
    }
  } catch (error) {
    console.error(`Error parsing config file ${configFile}:`, error);
  }
  
  return config;
}

/**
 * Get user information from gith config
 */
export async function getGithUser(): Promise<{ name?: string; email?: string } | null> {
  const config = await getGithConfig();
  
  const name = config['user.name'];
  const email = config['user.email'];
  
  if (!name && !email) {
    return null;
  }
  
  return { name, email };
}