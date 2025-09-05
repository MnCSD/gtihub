import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const initCommand = new Command('init')
  .description('Create an empty Gith repository or reinitialize an existing one')
  .action(async () => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');

    try {
      // Check if .gith already exists
      if (await fs.pathExists(githDir)) {
        console.log(chalk.yellow('Reinitialized existing Gith repository in'), chalk.blue(githDir));
        return;
      }

      // Create .gith directory structure
      await fs.ensureDir(githDir);
      await fs.ensureDir(path.join(githDir, 'objects'));
      await fs.ensureDir(path.join(githDir, 'refs', 'heads'));
      await fs.ensureDir(path.join(githDir, 'refs', 'tags'));

      // Create HEAD file pointing to main branch
      await fs.writeFile(
        path.join(githDir, 'HEAD'), 
        'ref: refs/heads/main\n'
      );

      // Create config file
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
        'Unnamed repository; edit this file \'description\' to name the repository.\n'
      );

      // Hide the .gith directory on Windows
      if (process.platform === 'win32') {
        try {
          await execAsync(`attrib +H "${githDir}"`);
        } catch (hideError) {
          // If hiding fails, continue anyway
          console.warn(chalk.yellow('Warning: Could not hide .gith directory'));
        }
      }

      console.log(chalk.green('Initialized empty Gith repository in'), chalk.blue(githDir));

    } catch (error) {
      console.error(chalk.red('Error initializing repository:'), error);
      process.exit(1);
    }
  });