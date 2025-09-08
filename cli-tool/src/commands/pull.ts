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

interface PullData {
  commits: CommitData[];
  hasNewCommits: boolean;
  newCommitsCount: number;
  headCommit?: string;
}

export const pullCommand = new Command('pull')
  .description('Fetch from and integrate with another repository or a local branch')
  .argument('[remote]', 'remote name', 'origin')
  .argument('[branch]', 'branch name')
  .action(async (remoteName?: string, branchName?: string) => {
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

      // Get current commit SHA (if any)
      let currentCommitSha: string | undefined;
      if (await fs.pathExists(branchFile)) {
        currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();
      }

      // Convert web URL to API URL
      const apiUrl = getApiUrl(remote.url);
      const encodedRepositoryId = encodeURIComponent(repositoryId);
      
      // Get user email for authentication
      const userEmail = await getGithConfigValue('user.email');
      
      console.log(chalk.blue('Fetching from'), chalk.yellow(remote.url));

      // Fetch new commits from the remote
      const endpoint = `${apiUrl}/repositories/${encodedRepositoryId}/pull`;
      
      try {
        const response = await axios.post(endpoint, {
          branch: targetBranch,
          currentCommit: currentCommitSha,
          userEmail: userEmail
        });

        const pullData: PullData = response.data;

        if (!pullData.hasNewCommits) {
          console.log(chalk.green('Already up to date.'));
          return;
        }

        console.log(chalk.blue(`Fetching ${pullData.newCommitsCount} new commit${pullData.newCommitsCount !== 1 ? 's' : ''}...`));

        // Store new commit objects
        for (const commit of pullData.commits) {
          // Create commit object
          let commitContent = `tree ${commit.treeHash}\n`;
          if (commit.parentSha) {
            commitContent += `parent ${commit.parentSha}\n`;
          }
          commitContent += `author ${commit.author.name} <${commit.author.email}> ${Math.floor(new Date(commit.timestamp).getTime() / 1000)} +0000\n`;
          commitContent += `committer ${commit.committer.name} <${commit.committer.email}> ${Math.floor(new Date(commit.timestamp).getTime() / 1000)} +0000\n`;
          commitContent += `\n${commit.message}\n`;

          // Store commit object
          const commitDir = path.join(githDir, 'objects', commit.sha.substring(0, 2));
          const commitFile = path.join(commitDir, commit.sha.substring(2));
          await fs.ensureDir(commitDir);
          await fs.writeFile(commitFile, commitContent);

          // Create tree object
          const treeEntries = commit.files.map(file => {
            return `${file.mode} blob ${file.hash}\t${file.path}`;
          }).sort().join('\n');

          const treeContent = `tree\n${treeEntries}\n`;
          const treeDir = path.join(githDir, 'objects', commit.treeHash.substring(0, 2));
          const treeFile = path.join(treeDir, commit.treeHash.substring(2));
          await fs.ensureDir(treeDir);
          await fs.writeFile(treeFile, treeContent);

          // Store file objects
          for (const file of commit.files) {
            const objectDir = path.join(githDir, 'objects', file.hash.substring(0, 2));
            const objectFile = path.join(objectDir, file.hash.substring(2));
            await fs.ensureDir(objectDir);
            await fs.writeFile(objectFile, file.content);
          }
        }

        // Update branch reference to point to the new head
        if (pullData.headCommit) {
          await fs.writeFile(branchFile, pullData.headCommit);

          // Update working directory with the latest commit's files
          const headCommit = pullData.commits.find(c => c.sha === pullData.headCommit);
          if (headCommit) {
            console.log(chalk.blue('Updating files in working directory...'));
            
            // Get list of current files (excluding .gith directory)
            const currentFiles = new Set<string>();
            const getAllFiles = async (dir: string, relativePath = '') => {
              const items = await fs.readdir(dir);
              for (const item of items) {
                if (item === '.gith') continue; // Skip .gith directory
                const fullPath = path.join(dir, item);
                const relativeFile = relativePath ? path.join(relativePath, item) : item;
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                  await getAllFiles(fullPath, relativeFile);
                } else {
                  currentFiles.add(relativeFile.replace(/\\/g, '/'));
                }
              }
            };
            
            await getAllFiles(currentDir);

            // Track which files are in the new commit
            const newFiles = new Set<string>();

            // Update/create files from the head commit
            for (const file of headCommit.files) {
              newFiles.add(file.path);
              const filePath = path.join(currentDir, file.path);
              await fs.ensureDir(path.dirname(filePath));
              await fs.writeFile(filePath, file.content);
            }

            // Remove files that are no longer in the repository
            for (const currentFile of currentFiles) {
              if (!newFiles.has(currentFile)) {
                const filePath = path.join(currentDir, currentFile);
                if (await fs.pathExists(filePath)) {
                  await fs.remove(filePath);
                  console.log(chalk.gray(`Removed: ${currentFile}`));
                }
              }
            }
          }

          const shortOldSha = currentCommitSha ? currentCommitSha.substring(0, 7) : '0000000';
          const shortNewSha = pullData.headCommit.substring(0, 7);
          
          console.log(chalk.green('Updating'), chalk.yellow(`${shortOldSha}..${shortNewSha}`), chalk.green('Fast-forward'));
          console.log(chalk.green(`✓ Successfully pulled ${pullData.newCommitsCount} commit${pullData.newCommitsCount !== 1 ? 's' : ''}`));
          
          if (headCommit) {
            console.log(chalk.gray(`HEAD is now at ${shortNewSha} ${headCommit.message.split('\n')[0]}`));
          }
        }

      } catch (error: any) {
        if (error.response) {
          console.error(chalk.red('Pull failed:'), error.response.data.error || error.response.statusText);
          if (error.response.status === 401) {
            console.log(chalk.yellow('Hint: Make sure you are authenticated to the remote repository'));
          } else if (error.response.status === 404) {
            console.log(chalk.yellow('Hint: Make sure the repository and branch exist'));
          }
        } else if (error.request) {
          console.error(chalk.red('Pull failed: Unable to connect to remote repository'));
          console.log(chalk.yellow(`Hint: Check if ${apiUrl} is accessible`));
        } else {
          console.error(chalk.red('Pull failed:'), error.message);
        }
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('Error during pull:'), error);
      process.exit(1);
    }
  });