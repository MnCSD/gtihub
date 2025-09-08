"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remoteCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const remote_1 = require("../utils/remote");
exports.remoteCommand = new commander_1.Command('remote')
    .description('Manage set of tracked repositories')
    .action(async () => {
    // List all remotes
    const remoteConfig = await (0, remote_1.getRemoteConfig)('origin');
    if (remoteConfig) {
        console.log(chalk_1.default.green('origin'), remoteConfig.url);
        if (remoteConfig.repositoryId) {
            console.log(chalk_1.default.gray(`  Repository ID: ${remoteConfig.repositoryId}`));
        }
    }
    else {
        console.log(chalk_1.default.yellow('No remotes configured'));
    }
});
// Add subcommand
exports.remoteCommand
    .command('add')
    .description('Add a remote')
    .argument('<name>', 'remote name')
    .argument('<url>', 'remote URL')
    .option('-r, --repository-id <id>', 'repository ID')
    .action(async (name, url, options) => {
    try {
        await (0, remote_1.setRemoteConfig)(name, url, options.repositoryId);
        console.log(chalk_1.default.green(`Added remote '${name}': ${url}`));
        if (options.repositoryId) {
            console.log(chalk_1.default.gray(`  Repository ID: ${options.repositoryId}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error adding remote:'), error);
        process.exit(1);
    }
});
// Remove subcommand  
exports.remoteCommand
    .command('remove')
    .alias('rm')
    .description('Remove a remote')
    .argument('<name>', 'remote name')
    .action(async (name) => {
    try {
        await (0, remote_1.removeRemoteConfig)(name);
        console.log(chalk_1.default.green(`Removed remote '${name}'`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error removing remote:'), error);
        process.exit(1);
    }
});
// Set-url subcommand
exports.remoteCommand
    .command('set-url')
    .description('Change URL for a remote')
    .argument('<name>', 'remote name')
    .argument('<newurl>', 'new URL')
    .option('-r, --repository-id <id>', 'repository ID')
    .action(async (name, newUrl, options) => {
    try {
        await (0, remote_1.setRemoteConfig)(name, newUrl, options.repositoryId);
        console.log(chalk_1.default.green(`Updated remote '${name}': ${newUrl}`));
        if (options.repositoryId) {
            console.log(chalk_1.default.gray(`  Repository ID: ${options.repositoryId}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error updating remote:'), error);
        process.exit(1);
    }
});
// Show subcommand
exports.remoteCommand
    .command('show')
    .description('Show information about a remote')
    .argument('[name]', 'remote name', 'origin')
    .action(async (name) => {
    try {
        const remoteConfig = await (0, remote_1.getRemoteConfig)(name);
        if (remoteConfig) {
            console.log(chalk_1.default.blue(`Remote '${name}':`));
            console.log(`  URL: ${remoteConfig.url}`);
            if (remoteConfig.repositoryId) {
                console.log(`  Repository ID: ${remoteConfig.repositoryId}`);
            }
        }
        else {
            console.log(chalk_1.default.yellow(`Remote '${name}' not found`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error showing remote:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=remote.js.map