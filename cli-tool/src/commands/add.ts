import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

export const addCommand = new Command('add')
  .description('Add file contents to the index')
  .argument('<files...>', 'Files to add to the staging area')
  .action(async (files: string[]) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');

    try {
      // Check if .gith repository exists
      if (!(await fs.pathExists(githDir))) {
        console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
        process.exit(1);
      }

      // Load existing index or create empty one
      let index: any = {};
      if (await fs.pathExists(indexFile)) {
        const indexContent = await fs.readFile(indexFile, 'utf-8');
        index = JSON.parse(indexContent);
      }

      for (const file of files) {
        const filePath = path.resolve(currentDir, file);
        
        // Check if file exists
        if (!(await fs.pathExists(filePath))) {
          console.error(chalk.red(`fatal: pathspec '${file}' did not match any files`));
          continue;
        }

        // Check if it's a file (not directory)
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) {
          console.error(chalk.yellow(`warning: '${file}' is not a regular file, skipping`));
          continue;
        }

        // Read file content and create hash
        const content = await fs.readFile(filePath);
        const hash = crypto.createHash('sha1').update(content).digest('hex');
        
        // Store object in objects directory
        const objectDir = path.join(githDir, 'objects', hash.substring(0, 2));
        const objectFile = path.join(objectDir, hash.substring(2));
        
        await fs.ensureDir(objectDir);
        await fs.writeFile(objectFile, content);

        // Add to index
        const relativePath = path.relative(currentDir, filePath);
        index[relativePath] = {
          hash: hash,
          mode: '100644',
          size: content.length,
          mtime: stat.mtime.getTime()
        };

        console.log(chalk.green(`Added '${relativePath}' to staging area`));
      }

      // Save updated index
      await fs.writeFile(indexFile, JSON.stringify(index, null, 2));

    } catch (error) {
      console.error(chalk.red('Error adding files:'), error);
      process.exit(1);
    }
  });