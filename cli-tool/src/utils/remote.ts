import * as fs from 'fs-extra';
import * as path from 'path';

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
export function parseWebUrl(url: string): { username: string; repoName: string; baseUrl: string } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length >= 2) {
      return {
        username: pathParts[0],
        repoName: pathParts[1],
        baseUrl: `${urlObj.protocol}//${urlObj.host}`
      };
    }
  } catch (error) {
    // Invalid URL format
  }
  return null;
}

/**
 * Convert web URL to API endpoint URL
 */
export function getApiUrl(webUrl: string): string {
  const parsed = parseWebUrl(webUrl);
  if (parsed) {
    return `${parsed.baseUrl}/api`;
  }
  // Fallback: if it's already an API URL, return as is
  if (webUrl.includes('/api')) {
    return webUrl;
  }
  // Default API endpoint
  return `${webUrl}/api`;
}

/**
 * Get the remote configuration from the local .gith/config
 */
export async function getRemoteConfig(remoteName: string = 'origin'): Promise<RemoteConfig | null> {
  const currentDir = process.cwd();
  const githDir = path.join(currentDir, '.gith');
  const configFile = path.join(githDir, 'config');
  
  if (!(await fs.pathExists(configFile))) {
    return null;
  }
  
  try {
    const configContent = await fs.readFile(configFile, 'utf-8');
    const lines = configContent.split('\n');
    
    let currentSection = '';
    let remoteUrl = '';
    let repositoryId = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
      } else if (trimmed.includes('=')) {
        const [key, value] = trimmed.split('=').map(s => s.trim());
        
        if (currentSection === `remote "${remoteName}"`) {
          if (key === 'url') {
            remoteUrl = value;
          } else if (key === 'repositoryId') {
            repositoryId = value;
          }
        }
      }
    }
    
    if (remoteUrl) {
      const parsed = parseWebUrl(remoteUrl);
      return {
        name: remoteName,
        url: remoteUrl,
        repositoryId: repositoryId || (parsed ? `${parsed.username}/${parsed.repoName}` : undefined),
        username: parsed?.username,
        repoName: parsed?.repoName
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error reading remote config:', error);
    return null;
  }
}

/**
 * Add or update a remote configuration
 */
export async function setRemoteConfig(remoteName: string, url: string, repositoryId?: string): Promise<void> {
  const currentDir = process.cwd();
  const githDir = path.join(currentDir, '.gith');
  const configFile = path.join(githDir, 'config');
  
  if (!(await fs.pathExists(configFile))) {
    throw new Error('Not a gith repository');
  }
  
  let configContent = await fs.readFile(configFile, 'utf-8');
  const lines = configContent.split('\n');
  
  // Check if remote already exists
  let remoteExists = false;
  let remoteSectionStart = -1;
  let remoteSectionEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === `[remote "${remoteName}"]`) {
      remoteExists = true;
      remoteSectionStart = i;
      
      // Find the end of this section
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().startsWith('[')) {
          remoteSectionEnd = j;
          break;
        }
      }
      if (remoteSectionEnd === -1) {
        remoteSectionEnd = lines.length;
      }
      break;
    }
  }
  
  const remoteSection = [
    `[remote "${remoteName}"]`,
    `\turl = ${url}`
  ];
  
  if (repositoryId) {
    remoteSection.push(`\trepositoryId = ${repositoryId}`);
  }
  
  if (remoteExists) {
    // Replace existing remote section
    lines.splice(remoteSectionStart, remoteSectionEnd - remoteSectionStart, ...remoteSection);
  } else {
    // Add new remote section at the end
    if (lines[lines.length - 1] !== '') {
      lines.push('');
    }
    lines.push(...remoteSection);
  }
  
  await fs.writeFile(configFile, lines.join('\n') + '\n');
}

/**
 * Remove a remote configuration
 */
export async function removeRemoteConfig(remoteName: string): Promise<void> {
  const currentDir = process.cwd();
  const githDir = path.join(currentDir, '.gith');
  const configFile = path.join(githDir, 'config');
  
  if (!(await fs.pathExists(configFile))) {
    throw new Error('Not a gith repository');
  }
  
  let configContent = await fs.readFile(configFile, 'utf-8');
  const lines = configContent.split('\n');
  
  // Find and remove the remote section
  let remoteSectionStart = -1;
  let remoteSectionEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === `[remote "${remoteName}"]`) {
      remoteSectionStart = i;
      
      // Find the end of this section
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().startsWith('[')) {
          remoteSectionEnd = j;
          break;
        }
      }
      if (remoteSectionEnd === -1) {
        remoteSectionEnd = lines.length;
      }
      break;
    }
  }
  
  if (remoteSectionStart !== -1) {
    lines.splice(remoteSectionStart, remoteSectionEnd - remoteSectionStart);
    await fs.writeFile(configFile, lines.join('\n') + '\n');
  }
}