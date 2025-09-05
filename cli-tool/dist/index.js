#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const hello_1 = require("./commands/hello");
const init_1 = require("./commands/init");
const add_1 = require("./commands/add");
const status_1 = require("./commands/status");
const commit_1 = require("./commands/commit");
const push_1 = require("./commands/push");
const config_1 = require("./commands/config");
const log_1 = require("./commands/log");
const program = new commander_1.Command();
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
   init       Create an empty Gith repository or reinitialize an existing one

work on the current change
   add        Add file contents to the index

examine the history and state
   status     Show the working tree status
   log        Show commit logs

grow, mark and tweak your common history
   commit     Record changes to the repository

collaborate
   push       Update remote refs along with associated objects

setup and config
   config     Get and set repository or global options

testing and development
   hello      Print Hello World

'gith help <command>' to read about a specific subcommand.
See 'gith --version' for version information.`;
    },
});
// Register commands
program.addCommand(hello_1.helloCommand);
program.addCommand(init_1.initCommand);
program.addCommand(add_1.addCommand);
program.addCommand(status_1.statusCommand);
program.addCommand(commit_1.commitCommand);
program.addCommand(push_1.pushCommand);
program.addCommand(config_1.configCommand);
program.addCommand(log_1.logCommand);
// Global error handler
program.exitOverride((err) => {
    if (err.code === "commander.unknownCommand") {
        console.error(chalk_1.default.red(`Error: Unknown command '${err.message.split("'")[1]}'`));
        console.log(chalk_1.default.yellow("Run 'gith --help' for available commands"));
    }
    else if (err.code === "commander.helpDisplayed" ||
        err.code === "commander.version") {
        // Don't show error for help display or version
        process.exit(0);
    }
    else {
        console.error(chalk_1.default.red(`Error: ${err.message}`));
    }
    process.exit(1);
});
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map