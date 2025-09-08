import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { getRemoteConfig, getApiUrl } from '../utils/remote';

async function getGithConfigValue(key: string): Promise<string | undefined> {
  const currentDir = process.cwd();
  const githDir = path.join(currentDir, '.gith');
  
  // Try local config first
  const localConfigFile = path.join(githDir, 'config');
  if (await fs.pathExists(localConfigFile)) {
    const configValue = await parseConfigFile(localConfigFile, key);
    if (configValue !== undefined) return configValue;
  }
  
  // Try global config
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const globalConfigFile = path.join(homeDir, '.githconfig');
  if (await fs.pathExists(globalConfigFile)) {
    return await parseConfigFile(globalConfigFile, key);
  }
  
  return undefined;
}

async function parseConfigFile(configFile: string, searchKey: string): Promise<string | undefined> {
  const configContent = await fs.readFile(configFile, 'utf-8');
  const lines = configContent.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
    } else if (trimmed.includes('=')) {
      const [configKey, configValue] = trimmed.split('=').map(s => s.trim());
      const fullKey = currentSection ? `${currentSection}.${configKey}` : configKey;
      if (fullKey === searchKey) {
        return configValue;
      }
    }
  }
  
  return undefined;
}

interface CommitData {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  committer: {
    name: string;
    email: string;
  };
  timestamp: string;
  treeHash: string;
  parentSha?: string;
  files: {
    path: string;
    content: string;
    hash: string;
    mode: string;
    action: string;
  }[];
}

export const pushCommand = new Command('push')
  .description('Update remote refs along with associated objects')
  .argument('[remote]', 'remote name', 'origin')
  .argument('[branch]', 'branch name')
  .option('-u, --set-upstream', 'set upstream for git pull/status')
  .action(async (remoteName?: string, branchName?: string, options?: any) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const headFile = path.join(githDir, 'HEAD');

    try {
      // Check if .gith repository exists
      if (!(await fs.pathExists(githDir))) {
        console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
        process.exit(1);
      }

      // Get current branch
      const headContent = await fs.readFile(headFile, 'utf-8');
      const branchRef = headContent.trim().replace('ref: ', '');
      const currentBranch = branchRef.split('/').pop() || 'main';
      const targetBranch = branchName || currentBranch;
      const branchFile = path.join(githDir, branchRef);

      if (!(await fs.pathExists(branchFile))) {
        console.error(chalk.red('fatal: no commits to push'));
        process.exit(1);
      }

      const currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();

      // Get remote configuration
      const remote = await getRemoteConfig(remoteName || 'origin');
      if (!remote) {
        console.error(chalk.red(`fatal: no remote configured for '${remoteName || 'origin'}'`));
        console.log(chalk.yellow('Hint: Run "gith remote add origin <url>" to add a remote'));
        process.exit(1);
      }

      // Extract repository info from URL or use stored repositoryId
      let repositoryId = remote.repositoryId;
      if (!repositoryId && remote.username && remote.repoName) {
        repositoryId = `${remote.username}/${remote.repoName}`;
      }

      if (!repositoryId) {
        console.error(chalk.red('fatal: unable to determine repository from remote URL'));
        console.log(chalk.yellow('Hint: Use format https://localhost:3000/{username}/{reponame}'));
        process.exit(1);
      }

      // Convert web URL to API URL
      const apiUrl = getApiUrl(remote.url);
      // URL encode the repository ID to handle username/reponame format
      const encodedRepositoryId = encodeURIComponent(repositoryId);
      const endpoint = `${apiUrl}/repositories/${encodedRepositoryId}/commits`;

      console.log(chalk.blue('Pushing to'), chalk.yellow(remote.url));

      // Collect all commits to push (walk back from current commit)
      const commitsToSend: CommitData[] = [];
      const processedCommits = new Set<string>();
      
      const collectCommits = async (commitSha: string): Promise<void> => {
        if (processedCommits.has(commitSha)) return;
        processedCommits.add(commitSha);

        const commitDir = path.join(githDir, 'objects', commitSha.substring(0, 2));
        const commitFile = path.join(commitDir, commitSha.substring(2));

        if (!(await fs.pathExists(commitFile))) {
          console.error(chalk.red(`fatal: commit object ${commitSha} not found`));
          process.exit(1);
        }

        const commitContent = await fs.readFile(commitFile, 'utf-8');
        const lines = commitContent.split('\n');

        let treeHash = '';
        let parentSha: string | undefined;
        let author = '';
        let committer = '';
        let messageStart = 0;

        // Parse commit object
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('tree ')) {
            treeHash = line.substring(5);
          } else if (line.startsWith('parent ')) {
            parentSha = line.substring(7);
          } else if (line.startsWith('author ')) {
            author = line.substring(7);
          } else if (line.startsWith('committer ')) {
            committer = line.substring(10);
          } else if (line === '') {
            messageStart = i + 1;
            break;
          }
        }

        const message = lines.slice(messageStart).join('\n').trim();

        // Parse author/committer info
        const parseAuthorInfo = (authorLine: string) => {
          const match = authorLine.match(/^(.+) <(.+)> (\d+) ([\+\-]\d{4})$/);
          return match ? {
            name: match[1],
            email: match[2],
            timestamp: new Date(parseInt(match[3]) * 1000).toISOString()
          } : {
            name: 'Unknown',
            email: 'unknown@example.com',
            timestamp: new Date().toISOString()
          };
        };

        const authorInfo = parseAuthorInfo(author);
        const committerInfo = parseAuthorInfo(committer);

        // Get files from tree by parsing commit and finding all objects
        const files: CommitData['files'] = [];
        
        // Parse the tree object to get files
        const treeDir = path.join(githDir, 'objects', treeHash.substring(0, 2));
        const treeFile = path.join(treeDir, treeHash.substring(2));
        
        if (await fs.pathExists(treeFile)) {
          try {
            const treeContent = await fs.readFile(treeFile, 'utf-8');
            const treeLines = treeContent.split('\n').filter(line => line.trim());
            
            // Skip the first line which is "tree"
            for (let i = 1; i < treeLines.length; i++) {
              const line = treeLines[i];
              if (line.includes('\t')) {
                const [modeAndHash, filePath] = line.split('\t');
                const parts = modeAndHash.split(' ');
                if (parts.length >= 3) {
                  const mode = parts[0];
                  const hash = parts[2];
                  
                  // Read file content from objects
                  const objectDir = path.join(githDir, 'objects', hash.substring(0, 2));
                  const objectFile = path.join(objectDir, hash.substring(2));
                  
                  if (await fs.pathExists(objectFile)) {
                    const content = await fs.readFile(objectFile, 'utf-8');
                    files.push({
                      path: filePath,
                      content,
                      hash: hash,
                      mode: mode,
                      action: 'added'
                    });
                  }
                }
              }
            }
          } catch (e) {
            console.warn('Could not parse tree object for commit', commitSha);
            // Fallback: try to get files from working directory
            const allFiles = await fs.readdir(currentDir);
            for (const file of allFiles) {
              if (file.startsWith('.')) continue; // Skip hidden files
              const filePath = path.join(currentDir, file);
              const stat = await fs.stat(filePath);
              if (stat.isFile()) {
                const content = await fs.readFile(filePath, 'utf-8');
                const hash = crypto.createHash('sha1').update(content).digest('hex');
                files.push({
                  path: file,
                  content,
                  hash,
                  mode: '100644',
                  action: 'added'
                });
              }
            }
          }
        }

        const commitData: CommitData = {
          sha: commitSha,
          message,
          author: {
            name: authorInfo.name,
            email: authorInfo.email
          },
          committer: {
            name: committerInfo.name,
            email: committerInfo.email
          },
          timestamp: authorInfo.timestamp,
          treeHash,
          parentSha,
          files
        };

        commitsToSend.unshift(commitData); // Add to beginning for correct order

        // Recursively process parent commit
        if (parentSha) {
          await collectCommits(parentSha);
        }
      };

      await collectCommits(currentCommitSha);

      if (commitsToSend.length === 0) {
        console.log(chalk.yellow('Everything up-to-date'));
        return;
      }

      // Send commits to API
      try {
        // For testing, you can set this environment variable with a session token
        const authToken = process.env.GITH_AUTH_TOKEN;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        // Add auth header if token is provided
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Get user info from local gith config
        const userName = await getGithConfigValue('user.name');
        const userEmail = await getGithConfigValue('user.email');
        
        const requestData = { 
          commits: commitsToSend, 
          branch: targetBranch,
          user: { name: userName, email: userEmail } // Send user info with the request
        };

        const response = await axios.post(endpoint, requestData, { headers });

        const { commitsCreated } = response.data;

        console.log(chalk.green('To'), chalk.yellow(remote.url));
        
        if (commitsCreated > 0) {
          const shortSha = currentCommitSha.substring(0, 7);
          console.log(chalk.green(`   ${shortSha}..${shortSha}  ${targetBranch} -> ${targetBranch}`));
          console.log(chalk.green(`✓ Successfully pushed ${commitsCreated} commit${commitsCreated !== 1 ? 's' : ''}`));
        } else {
          console.log(chalk.yellow('Everything up-to-date'));
        }

      } catch (error: any) {
        if (error.response) {
          console.error(chalk.red('Push failed:'), error.response.data.error || error.response.statusText);
          if (error.response.status === 401) {
            console.log(chalk.yellow('Hint: Make sure you are authenticated to the remote repository'));
          }
        } else if (error.request) {
          console.error(chalk.red('Push failed: Unable to connect to remote repository'));
          console.log(chalk.yellow(`Hint: Check if ${apiUrl} is accessible`));
        } else {
          console.error(chalk.red('Push failed:'), error.message);
        }
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('Error during push:'), error);
      process.exit(1);
    }
  });