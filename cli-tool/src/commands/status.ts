import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { glob } from 'glob';
import { apiClient } from '../utils/api';
import { getRemoteConfig, getApiUrl } from '../utils/remote';

interface FileStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
}

export const statusCommand = new Command('status')
  .description('Show the working tree status')
  .action(async () => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');

    try {
      // Check if .gith repository exists
      if (!(await fs.pathExists(githDir))) {
        console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
        process.exit(1);
      }

      // Get remote configuration
      const remoteConfig = await getRemoteConfig('origin');
      if (!remoteConfig || !remoteConfig.username || !remoteConfig.repoName) {
        // Fallback to local-only status if no remote
        console.log(chalk.yellow('Warning: No remote configured. Showing local-only status.'));
        await showLocalStatus(currentDir, githDir, indexFile);
        return;
      }

      const status: FileStatus = {
        staged: [],
        modified: [],
        untracked: []
      };

      // Get remote repository state
      let remoteFiles: { [key: string]: { content: string; hash: string } } = {};
      try {
        const commitsResponse = await apiClient.getCommits(remoteConfig.username, remoteConfig.repoName, remoteConfig.url);
        if (commitsResponse.success && commitsResponse.data && commitsResponse.data.length > 0) {
          // Build current remote file state from all commits (latest version of each file)
          for (const commit of commitsResponse.data) {
            if (commit.files) {
              for (const file of commit.files) {
                if (file.action !== 'deleted' && !remoteFiles[file.path]) {
                  // Only add if we haven't seen this file path yet (keeps the latest version)
                  remoteFiles[file.path] = {
                    content: file.content,
                    hash: file.hash
                  };
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(chalk.yellow('Warning: Could not fetch remote repository state. Showing local-only status.'));
        await showLocalStatus(currentDir, githDir, indexFile);
        return;
      }

      // Load staged files from index
      let stagedFiles: any = {};
      if (await fs.pathExists(indexFile)) {
        const indexContent = await fs.readFile(indexFile, 'utf-8');
        stagedFiles = JSON.parse(indexContent);
      }

      // Get all files in the working directory
      const allFiles = await glob('**/*', {
        cwd: currentDir,
        ignore: ['.gith/**', '**/node_modules/**', '**/.git/**'],
        nodir: true,
        dot: false
      });

      // Check each local file's status
      for (const file of allFiles) {
        const filePath = path.join(currentDir, file);
        const relativePath = path.relative(currentDir, filePath).replace(/\\/g, '/'); // Normalize path separators
        const content = await fs.readFile(filePath, 'utf-8');
        const currentHash = crypto.createHash('sha1').update(content).digest('hex');


        // Check if file is staged
        if (stagedFiles[relativePath]) {
          status.staged.push(relativePath);
        } 
        // Check if file exists remotely
        else if (remoteFiles[relativePath]) {
          // File exists in remote repository
          if (currentHash !== remoteFiles[relativePath].hash && content !== remoteFiles[relativePath].content) {
            // File has been modified locally
            status.modified.push(relativePath);
          }
          // If hashes match, file is unchanged (not included in any status)
        } else {
          // File doesn't exist remotely - it's untracked
          status.untracked.push(relativePath);
        }
      }

      // Check for deleted files (exist remotely but not locally)
      for (const remotePath of Object.keys(remoteFiles)) {
        if (!allFiles.includes(remotePath) && !allFiles.includes(remotePath.replace(/\//g, '\\'))) {
          status.modified.push(remotePath + ' (deleted)');
        }
      }

      // Display status
      console.log(chalk.bold('On branch main\n'));

      if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
        console.log(chalk.green('nothing to commit, working tree clean'));
        return;
      }

      if (status.staged.length > 0) {
        console.log(chalk.green('Changes to be committed:'));
        console.log(chalk.dim('  (use "gith reset <file>..." to unstage)\n'));
        status.staged.forEach(file => {
          console.log(chalk.green(`\tstaged:     ${file}`));
        });
        console.log();
      }

      if (status.modified.length > 0) {
        console.log(chalk.red('Changes not staged for commit:'));
        console.log(chalk.dim('  (use "gith add <file>..." to update what will be committed)'));
        console.log(chalk.dim('  (use "gith checkout -- <file>..." to discard changes in working directory)\n'));
        status.modified.forEach(file => {
          if (file.endsWith(' (deleted)')) {
            console.log(chalk.red(`\tdeleted:    ${file.replace(' (deleted)', '')}`));
          } else {
            console.log(chalk.red(`\tmodified:   ${file}`));
          }
        });
        console.log();
      }

      if (status.untracked.length > 0) {
        console.log(chalk.red('Untracked files:'));
        console.log(chalk.dim('  (use "gith add <file>..." to include in what will be committed)\n'));
        status.untracked.forEach(file => {
          console.log(chalk.red(`\t${file}`));
        });
        console.log();
      }

    } catch (error) {
      console.error(chalk.red('Error getting status:'), error);
      process.exit(1);
    }
  });

// Fallback function for local-only status (original logic)
async function showLocalStatus(currentDir: string, githDir: string, indexFile: string) {
  const status: FileStatus = {
    staged: [],
    modified: [],
    untracked: []
  };

  // Load existing index
  let index: any = {};
  if (await fs.pathExists(indexFile)) {
    const indexContent = await fs.readFile(indexFile, 'utf-8');
    index = JSON.parse(indexContent);
  }

  // Get all files in the working directory
  const allFiles = await glob('**/*', {
    cwd: currentDir,
    ignore: ['.gith/**', '**/node_modules/**', '**/.git/**'],
    nodir: true,
    dot: false
  });

  // Check each file's status
  for (const file of allFiles) {
    const filePath = path.join(currentDir, file);
    const relativePath = path.relative(currentDir, filePath);

    if (index[relativePath]) {
      // File is in index (staged)
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath);
      const currentHash = crypto.createHash('sha1').update(content).digest('hex');

      if (currentHash !== index[relativePath].hash || 
          stat.mtime.getTime() !== index[relativePath].mtime) {
        // File has been modified since staging
        status.modified.push(relativePath);
      } else {
        // File is staged and unchanged
        status.staged.push(relativePath);
      }
    } else {
      // File is not in index (untracked)
      status.untracked.push(relativePath);
    }
  }

  // Check for deleted files (in index but not in working directory)
  for (const indexFile of Object.keys(index)) {
    if (!allFiles.includes(indexFile)) {
      status.modified.push(indexFile + ' (deleted)');
    }
  }

  // Display status
  console.log(chalk.bold('On branch main\n'));

  if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
    console.log(chalk.green('nothing to commit, working tree clean'));
    return;
  }

  if (status.staged.length > 0) {
    console.log(chalk.green('Changes to be committed:'));
    console.log(chalk.dim('  (use "gith reset <file>..." to unstage)\n'));
    status.staged.forEach(file => {
      console.log(chalk.green(`\tnew file:   ${file}`));
    });
    console.log();
  }

  if (status.modified.length > 0) {
    console.log(chalk.red('Changes not staged for commit:'));
    console.log(chalk.dim('  (use "gith add <file>..." to update what will be committed)'));
    console.log(chalk.dim('  (use "gith checkout -- <file>..." to discard changes in working directory)\n'));
    status.modified.forEach(file => {
      if (file.endsWith(' (deleted)')) {
        console.log(chalk.red(`\tdeleted:    ${file.replace(' (deleted)', '')}`));
      } else {
        console.log(chalk.red(`\tmodified:   ${file}`));
      }
    });
    console.log();
  }

  if (status.untracked.length > 0) {
    console.log(chalk.red('Untracked files:'));
    console.log(chalk.dim('  (use "gith add <file>..." to include in what will be committed)\n'));
    status.untracked.forEach(file => {
      console.log(chalk.red(`\t${file}`));
    });
    console.log();
  }
}