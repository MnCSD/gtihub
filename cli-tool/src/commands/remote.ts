import { Command } from 'commander';
import chalk from 'chalk';
import { getRemoteConfig, setRemoteConfig, removeRemoteConfig } from '../utils/remote';

export const remoteCommand = new Command('remote')
  .description('Manage set of tracked repositories')
  .action(async () => {
    // List all remotes
    const remoteConfig = await getRemoteConfig('origin');
    if (remoteConfig) {
      console.log(chalk.green('origin'), remoteConfig.url);
      if (remoteConfig.repositoryId) {
        console.log(chalk.gray(`  Repository ID: ${remoteConfig.repositoryId}`));
      }
    } else {
      console.log(chalk.yellow('No remotes configured'));
    }
  });

// Add subcommand
remoteCommand
  .command('add')
  .description('Add a remote')
  .argument('<name>', 'remote name')
  .argument('<url>', 'remote URL')
  .option('-r, --repository-id <id>', 'repository ID')
  .action(async (name: string, url: string, options: any) => {
    try {
      await setRemoteConfig(name, url, options.repositoryId);
      console.log(chalk.green(`Added remote '${name}': ${url}`));
      if (options.repositoryId) {
        console.log(chalk.gray(`  Repository ID: ${options.repositoryId}`));
      }
    } catch (error) {
      console.error(chalk.red('Error adding remote:'), error);
      process.exit(1);
    }
  });

// Remove subcommand  
remoteCommand
  .command('remove')
  .alias('rm')
  .description('Remove a remote')
  .argument('<name>', 'remote name')
  .action(async (name: string) => {
    try {
      await removeRemoteConfig(name);
      console.log(chalk.green(`Removed remote '${name}'`));
    } catch (error) {
      console.error(chalk.red('Error removing remote:'), error);
      process.exit(1);
    }
  });

// Set-url subcommand
remoteCommand
  .command('set-url')
  .description('Change URL for a remote')
  .argument('<name>', 'remote name')
  .argument('<newurl>', 'new URL')
  .option('-r, --repository-id <id>', 'repository ID')
  .action(async (name: string, newUrl: string, options: any) => {
    try {
      await setRemoteConfig(name, newUrl, options.repositoryId);
      console.log(chalk.green(`Updated remote '${name}': ${newUrl}`));
      if (options.repositoryId) {
        console.log(chalk.gray(`  Repository ID: ${options.repositoryId}`));
      }
    } catch (error) {
      console.error(chalk.red('Error updating remote:'), error);
      process.exit(1);
    }
  });

// Show subcommand
remoteCommand
  .command('show')
  .description('Show information about a remote')
  .argument('[name]', 'remote name', 'origin')
  .action(async (name: string) => {
    try {
      const remoteConfig = await getRemoteConfig(name);
      if (remoteConfig) {
        console.log(chalk.blue(`Remote '${name}':`));
        console.log(`  URL: ${remoteConfig.url}`);
        if (remoteConfig.repositoryId) {
          console.log(`  Repository ID: ${remoteConfig.repositoryId}`);
        }
      } else {
        console.log(chalk.yellow(`Remote '${name}' not found`));
      }
    } catch (error) {
      console.error(chalk.red('Error showing remote:'), error);
      process.exit(1);
    }
  });