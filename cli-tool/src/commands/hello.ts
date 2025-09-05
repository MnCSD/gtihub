import { Command } from 'commander';
import chalk from 'chalk';

export const helloCommand = new Command('hello')
  .description('Print Hello World')
  .action(() => {
    console.log(chalk.green('Hello World!'));
  });