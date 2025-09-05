import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { setRemoteConfig } from '../utils/remote';

const execAsync = promisify(exec);

interface CloneData {
  repository: {
    id: string;
    name: string;
    description?: string;
    owner: {
      name: string;
      email: string;
    };
  };
  commits: Array<{
    sha: string;
    message: string;
    author: { name: string; email: string };
    committer: { name: string; email: string };
    timestamp: string;
    treeHash: string;
    parentSha?: string;
    files: Array<{
      path: string;
      content: string;
      hash: string;
      mode: string;
      action: string;
    }>;
  }>;
  branches: Array<{
    name: string;
    commitSha?: string;
  }>;
  defaultBranch: string;
  headCommit?: string;
}

export const cloneCommand = new Command('clone')
  .description('Clone a repository into a new directory')
  .argument('<url>', 'repository URL (e.g., http://localhost:3000/api)')
  .argument('<repository-id>', 'repository ID to clone')
  .argument('[directory]', 'directory name (defaults to repository name)')
  .action(async (url: string, repositoryId: string, directory?: string) => {
    try {
      console.log(chalk.blue('Cloning repository...'));

      console.log(chalk.gray(`Fetching repository data for '${repositoryId}' from ${url}...`));

      // Fetch repository data from API
      let cloneData: CloneData;
      const useTestEndpoint = process.env.GITH_USE_TEST_ENDPOINT === 'true';

      if (useTestEndpoint) {
        // Use test endpoint for cloning
        const response = await axios.post(`${url}/test-clone`, {
          repositoryId,
          userEmail: 'mnikolopoylos@gmail.com' // Could be made configurable
        });
        cloneData = response.data;
      } else {
        // Use authenticated endpoint
        const response = await axios.get(`${url}/repositories/${repositoryId}/clone`);
        cloneData = response.data;
      }

      // Determine directory name
      const targetDir = directory || cloneData.repository.name;
      const targetPath = path.resolve(process.cwd(), targetDir);

      // Check if directory already exists
      if (await fs.pathExists(targetPath)) {
        console.error(chalk.red(`fatal: destination path '${targetDir}' already exists and is not an empty directory.`));
        process.exit(1);
      }

      console.log(chalk.gray(`Creating directory '${targetDir}'...`));
      await fs.ensureDir(targetPath);

      // Create .gith directory structure
      const githDir = path.join(targetPath, '.gith');
      await fs.ensureDir(githDir);
      await fs.ensureDir(path.join(githDir, 'objects'));
      await fs.ensureDir(path.join(githDir, 'refs', 'heads'));
      await fs.ensureDir(path.join(githDir, 'refs', 'tags'));

      // Create HEAD file
      await fs.writeFile(
        path.join(githDir, 'HEAD'),
        `ref: refs/heads/${cloneData.defaultBranch}\n`
      );

      // Create config file (basic config, remote will be added later)
      const config = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
\tlogallrefupdates = true
`;
      await fs.writeFile(path.join(githDir, 'config'), config);

      // Create description file
      await fs.writeFile(
        path.join(githDir, 'description'),
        cloneData.repository.description || `Repository cloned from ${url}\n`
      );

      console.log(chalk.gray(`Recreating ${cloneData.commits.length} commits...`));

      // Recreate commits in chronological order
      for (const commit of cloneData.commits) {
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

      // Create branch references
      for (const branch of cloneData.branches) {
        if (branch.commitSha) {
          const branchFile = path.join(githDir, 'refs', 'heads', branch.name);
          await fs.writeFile(branchFile, branch.commitSha);
        }
      }

      // Checkout the default branch (recreate working directory)
      if (cloneData.headCommit) {
        console.log(chalk.gray(`Checking out '${cloneData.defaultBranch}'...`));

        // Find the head commit
        const headCommit = cloneData.commits.find(c => c.sha === cloneData.headCommit);
        if (headCommit) {
          // Recreate files in working directory
          for (const file of headCommit.files) {
            const filePath = path.join(targetPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content);
          }
        }
      }

      // Set up remote configuration
      console.log(chalk.gray('Setting up remote origin...'));
      process.chdir(targetPath); // Change to the cloned directory
      await setRemoteConfig('origin', url, repositoryId);

      // Hide .gith directory on Windows
      if (process.platform === 'win32') {
        try {
          await execAsync(`attrib +H "${githDir}"`);
        } catch (hideError) {
          // If hiding fails, continue anyway
        }
      }

      console.log(chalk.green(`✓ Repository cloned successfully into '${targetDir}'`));
      console.log(chalk.gray(`  ${cloneData.commits.length} commits`));
      console.log(chalk.gray(`  ${cloneData.branches.length} branch${cloneData.branches.length !== 1 ? 'es' : ''}`));
      console.log(chalk.gray(`  HEAD is now at ${cloneData.headCommit?.substring(0, 7)} on ${cloneData.defaultBranch}`));

    } catch (error: any) {
      if (error.response) {
        console.error(chalk.red('Clone failed:'), error.response.data.error || error.response.statusText);
        if (error.response.status === 404) {
          console.log(chalk.yellow('Hint: Make sure the repository exists and you have access to it'));
        }
      } else if (error.request) {
        console.error(chalk.red('Clone failed: Unable to connect to remote repository'));
        console.log(chalk.yellow('Hint: Check your internet connection and repository URL'));
      } else {
        console.error(chalk.red('Clone failed:'), error.message);
      }
      process.exit(1);
    }
  });