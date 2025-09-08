#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { helloCommand } from "./commands/hello";
import { initCommand } from "./commands/init";
import { addCommand } from "./commands/add";
import { statusCommand } from "./commands/status";
import { commitCommand } from "./commands/commit";
import { pushCommand } from "./commands/push";
import { configCommand } from "./commands/config";
import { logCommand } from "./commands/log";
import { cloneCommand } from "./commands/clone";
import { remoteCommand } from "./commands/remote";
import { pullCommand } from "./commands/pull";

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

start a working area
   clone      Clone a repository into a new directory
   init       Create an empty Gith repository or reinitialize an existing one

work on the current change
   add        Add file contents to the index

examine the history and state
   status     Show the working tree status
   log        Show commit logs

grow, mark and tweak your common history
   commit     Record changes to the repository

collaborate
   pull       Fetch from and integrate with another repository or a local branch
   push       Update remote refs along with associated objects
   remote     Manage set of tracked repositories

setup and config
   config     Get and set repository or global options

testing and development
   hello      Print Hello World

'gith help <command>' to read about a specific subcommand.
See 'gith --version' for version information.`;
    },
  });

// Register commands
program.addCommand(helloCommand);
program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(statusCommand);
program.addCommand(commitCommand);
program.addCommand(pushCommand);
program.addCommand(configCommand);
program.addCommand(logCommand);
program.addCommand(cloneCommand);
program.addCommand(remoteCommand);
program.addCommand(pullCommand);

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
