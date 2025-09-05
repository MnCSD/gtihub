import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { glob } from 'glob';

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

    } catch (error) {
      console.error(chalk.red('Error getting status:'), error);
      process.exit(1);
    }
  });