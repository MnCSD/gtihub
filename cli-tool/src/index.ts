#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { helloCommand } from "./commands/hello";

const program = new Command();

program
  .name("gith")
  .description("")
  .version("1.0.0", "-v, --version", "display version number")
  .configureHelp({
    formatHelp: () => {
      return `usage: gith [-v | --version] [-h | --help]
       <command> [<args>]

These are common Gith commands used in various situations:

testing and development
   hello      Print Hello World

'gith help <command>' to read about a specific subcommand.
See 'gith --version' for version information.`;
    },
  });

// Register commands
program.addCommand(helloCommand);

// Global error handler
program.exitOverride((err) => {
  if (err.code === "commander.unknownCommand") {
    console.error(
      chalk.red(`Error: Unknown command '${err.message.split("'")[1]}'`)
    );
    console.log(chalk.yellow("Run 'gith --help' for available commands"));
  } else if (
    err.code === "commander.helpDisplayed" ||
    err.code === "commander.version"
  ) {
    // Don't show error for help display or version
    process.exit(0);
  } else {
    console.error(chalk.red(`Error: ${err.message}`));
  }
  process.exit(1);
});

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
