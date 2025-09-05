import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface CommitObject {
  tree: string;
  parent?: string;
  author: string;
  committer: string;
  message: string;
}

export const commitCommand = new Command('commit')
  .description('Record changes to the repository')
  .option('-m, --message <message>', 'commit message')
  .action(async (options) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');
    const headFile = path.join(githDir, 'HEAD');

    try {
      // Check if .gith repository exists
      if (!(await fs.pathExists(githDir))) {
        console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
        process.exit(1);
      }

      // Check if there are staged changes
      if (!(await fs.pathExists(indexFile))) {
        console.log(chalk.yellow('nothing to commit, working tree clean'));
        return;
      }

      const indexContent = await fs.readFile(indexFile, 'utf-8');
      const index = JSON.parse(indexContent);

      if (Object.keys(index).length === 0) {
        console.log(chalk.yellow('nothing to commit, working tree clean'));
        return;
      }

      // Get commit message
      const message = options.message;
      if (!message) {
        console.error(chalk.red('error: no commit message provided'));
        console.log(chalk.yellow('use: gith commit -m "your commit message"'));
        process.exit(1);
      }

      // Create tree object from staged files
      const treeEntries = Object.keys(index).map(filePath => {
        const fileData = index[filePath];
        return `100644 blob ${fileData.hash}\t${filePath}`;
      }).sort().join('\n');

      const treeContent = `tree\n${treeEntries}\n`;
      const treeHash = crypto.createHash('sha1').update(treeContent).digest('hex');

      // Store tree object
      const treeDir = path.join(githDir, 'objects', treeHash.substring(0, 2));
      const treeFile = path.join(treeDir, treeHash.substring(2));
      await fs.ensureDir(treeDir);
      await fs.writeFile(treeFile, treeContent);

      // Get parent commit if exists
      let parentCommit: string | undefined;
      const headContent = await fs.readFile(headFile, 'utf-8');
      const branchRef = headContent.trim().replace('ref: ', '');
      const branchFile = path.join(githDir, branchRef);
      
      if (await fs.pathExists(branchFile)) {
        parentCommit = (await fs.readFile(branchFile, 'utf-8')).trim();
      }

      // Get author info from config
      const author = await getAuthorFromConfig(githDir);
      const timestamp = new Date().toISOString();
      
      const commitObj: CommitObject = {
        tree: treeHash,
        author: `${author} ${Math.floor(Date.now() / 1000)} +0000`,
        committer: `${author} ${Math.floor(Date.now() / 1000)} +0000`,
        message: message
      };

      if (parentCommit) {
        commitObj.parent = parentCommit;
      }

      // Create commit content in Git format
      let commitContent = `tree ${commitObj.tree}\n`;
      if (commitObj.parent) {
        commitContent += `parent ${commitObj.parent}\n`;
      }
      commitContent += `author ${commitObj.author}\n`;
      commitContent += `committer ${commitObj.committer}\n`;
      commitContent += `\n${commitObj.message}\n`;

      // Hash the commit
      const commitHash = crypto.createHash('sha1').update(`commit ${commitContent.length}\0${commitContent}`).digest('hex');

      // Store commit object
      const commitDir = path.join(githDir, 'objects', commitHash.substring(0, 2));
      const commitFile = path.join(commitDir, commitHash.substring(2));
      await fs.ensureDir(commitDir);
      await fs.writeFile(commitFile, commitContent);

      // Update branch reference
      await fs.ensureDir(path.dirname(branchFile));
      await fs.writeFile(branchFile, commitHash);

      // Clear the index (staging area)
      await fs.writeFile(indexFile, '{}');

      // Display commit message like Git
      const shortHash = commitHash.substring(0, 7);
      const filesChanged = Object.keys(index).length;
      const isInitial = !parentCommit;

      if (isInitial) {
        console.log(chalk.green(`[main (root-commit) ${shortHash}] ${message}`));
      } else {
        console.log(chalk.green(`[main ${shortHash}] ${message}`));
      }

      console.log(chalk.white(`${filesChanged} file${filesChanged !== 1 ? 's' : ''} changed`));

      // Show files that were committed
      Object.keys(index).forEach(filePath => {
        console.log(chalk.green(` create mode 100644 ${filePath}`));
      });

    } catch (error) {
      console.error(chalk.red('Error creating commit:'), error);
      process.exit(1);
    }
  });

async function getAuthorFromConfig(githDir: string): Promise<string> {
  // Try local config first, then global
  const localConfigFile = path.join(githDir, 'config');
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const globalConfigFile = path.join(homeDir, '.githconfig');
  
  let name = 'Unknown User';
  let email = 'unknown@example.com';
  
  // Parse config files
  for (const configFile of [localConfigFile, globalConfigFile]) {
    if (await fs.pathExists(configFile)) {
      try {
        const configContent = await fs.readFile(configFile, 'utf-8');
        const lines = configContent.split('\n');
        let inUserSection = false;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '[user]') {
            inUserSection = true;
          } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            inUserSection = false;
          } else if (inUserSection && trimmed.includes('=')) {
            const [key, value] = trimmed.split('=').map(s => s.trim());
            if (key === 'name') name = value;
            if (key === 'email') email = value;
          }
        }
      } catch (e) {
        // Ignore config parsing errors
      }
    }
  }
  
  return `${name} <${email}>`;
}