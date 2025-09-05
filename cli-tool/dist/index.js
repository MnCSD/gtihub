#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const hello_1 = require("./commands/hello");
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

testing and development
   hello      Print Hello World

'gith help <command>' to read about a specific subcommand.
See 'gith --version' for version information.`;
    }
});
// Register commands
program.addCommand(hello_1.helloCommand);
// Global error handler
program.exitOverride((err) => {
    if (err.code === "commander.unknownCommand") {
        console.error(chalk_1.default.red(`Error: Unknown command '${err.message.split("'")[1]}'`));
        console.log(chalk_1.default.yellow("Run 'gith --help' for available commands"));
    }
    else if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
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