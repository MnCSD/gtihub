"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const glob_1 = require("glob");
const api_1 = require("../utils/api");
const remote_1 = require("../utils/remote");
exports.statusCommand = new commander_1.Command('status')
    .description('Show the working tree status')
    .action(async () => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');
    try {
        // Check if .gith repository exists
        if (!(await fs.pathExists(githDir))) {
            console.error(chalk_1.default.red('fatal: not a gith repository (or any of the parent directories): .gith'));
            process.exit(1);
        }
        // Get remote configuration
        const remoteConfig = await (0, remote_1.getRemoteConfig)('origin');
        if (!remoteConfig || !remoteConfig.username || !remoteConfig.repoName) {
            // Fallback to local-only status if no remote
            console.log(chalk_1.default.yellow('Warning: No remote configured. Showing local-only status.'));
            await showLocalStatus(currentDir, githDir, indexFile);
            return;
        }
        const status = {
            staged: [],
            modified: [],
            untracked: []
        };
        // Get remote repository state
        let remoteFiles = {};
        try {
            const commitsResponse = await api_1.apiClient.getCommits(remoteConfig.username, remoteConfig.repoName, remoteConfig.url);
            if (commitsResponse.success && commitsResponse.data && commitsResponse.data.length > 0) {
                // Build current remote file state from all commits (latest version of each file)
                for (const commit of commitsResponse.data) {
                    if (commit.files) {
                        for (const file of commit.files) {
                            if (file.action !== 'deleted' && !remoteFiles[file.path]) {
                                // Only add if we haven't seen this file path yet (keeps the latest version)
                                remoteFiles[file.path] = {
                                    content: file.content,
                                    hash: file.hash
                                };
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log(chalk_1.default.yellow('Warning: Could not fetch remote repository state. Showing local-only status.'));
            await showLocalStatus(currentDir, githDir, indexFile);
            return;
        }
        // Load staged files from index
        let stagedFiles = {};
        if (await fs.pathExists(indexFile)) {
            const indexContent = await fs.readFile(indexFile, 'utf-8');
            stagedFiles = JSON.parse(indexContent);
        }
        // Get all files in the working directory
        const allFiles = await (0, glob_1.glob)('**/*', {
            cwd: currentDir,
            ignore: ['.gith/**', '**/node_modules/**', '**/.git/**'],
            nodir: true,
            dot: false
        });
        // Check each local file's status
        for (const file of allFiles) {
            const filePath = path.join(currentDir, file);
            const relativePath = path.relative(currentDir, filePath).replace(/\\/g, '/'); // Normalize path separators
            const content = await fs.readFile(filePath, 'utf-8');
            const currentHash = crypto.createHash('sha1').update(content).digest('hex');
            // Check if file is staged
            if (stagedFiles[relativePath]) {
                status.staged.push(relativePath);
            }
            // Check if file exists remotely
            else if (remoteFiles[relativePath]) {
                // File exists in remote repository
                if (currentHash !== remoteFiles[relativePath].hash && content !== remoteFiles[relativePath].content) {
                    // File has been modified locally
                    status.modified.push(relativePath);
                }
                // If hashes match, file is unchanged (not included in any status)
            }
            else {
                // File doesn't exist remotely - it's untracked
                status.untracked.push(relativePath);
            }
        }
        // Check for deleted files (exist remotely but not locally)
        for (const remotePath of Object.keys(remoteFiles)) {
            if (!allFiles.includes(remotePath) && !allFiles.includes(remotePath.replace(/\//g, '\\'))) {
                status.modified.push(remotePath + ' (deleted)');
            }
        }
        // Display status
        console.log(chalk_1.default.bold('On branch main\n'));
        if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
            console.log(chalk_1.default.green('nothing to commit, working tree clean'));
            return;
        }
        if (status.staged.length > 0) {
            console.log(chalk_1.default.green('Changes to be committed:'));
            console.log(chalk_1.default.dim('  (use "gith reset <file>..." to unstage)\n'));
            status.staged.forEach(file => {
                console.log(chalk_1.default.green(`\tstaged:     ${file}`));
            });
            console.log();
        }
        if (status.modified.length > 0) {
            console.log(chalk_1.default.red('Changes not staged for commit:'));
            console.log(chalk_1.default.dim('  (use "gith add <file>..." to update what will be committed)'));
            console.log(chalk_1.default.dim('  (use "gith checkout -- <file>..." to discard changes in working directory)\n'));
            status.modified.forEach(file => {
                if (file.endsWith(' (deleted)')) {
                    console.log(chalk_1.default.red(`\tdeleted:    ${file.replace(' (deleted)', '')}`));
                }
                else {
                    console.log(chalk_1.default.red(`\tmodified:   ${file}`));
                }
            });
            console.log();
        }
        if (status.untracked.length > 0) {
            console.log(chalk_1.default.red('Untracked files:'));
            console.log(chalk_1.default.dim('  (use "gith add <file>..." to include in what will be committed)\n'));
            status.untracked.forEach(file => {
                console.log(chalk_1.default.red(`\t${file}`));
            });
            console.log();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error getting status:'), error);
        process.exit(1);
    }
});
// Fallback function for local-only status (original logic)
async function showLocalStatus(currentDir, githDir, indexFile) {
    const status = {
        staged: [],
        modified: [],
        untracked: []
    };
    // Load existing index
    let index = {};
    if (await fs.pathExists(indexFile)) {
        const indexContent = await fs.readFile(indexFile, 'utf-8');
        index = JSON.parse(indexContent);
    }
    // Get all files in the working directory
    const allFiles = await (0, glob_1.glob)('**/*', {
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
            }
            else {
                // File is staged and unchanged
                status.staged.push(relativePath);
            }
        }
        else {
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
    console.log(chalk_1.default.bold('On branch main\n'));
    if (status.staged.length === 0 && status.modified.length === 0 && status.untracked.length === 0) {
        console.log(chalk_1.default.green('nothing to commit, working tree clean'));
        return;
    }
    if (status.staged.length > 0) {
        console.log(chalk_1.default.green('Changes to be committed:'));
        console.log(chalk_1.default.dim('  (use "gith reset <file>..." to unstage)\n'));
        status.staged.forEach(file => {
            console.log(chalk_1.default.green(`\tnew file:   ${file}`));
        });
        console.log();
    }
    if (status.modified.length > 0) {
        console.log(chalk_1.default.red('Changes not staged for commit:'));
        console.log(chalk_1.default.dim('  (use "gith add <file>..." to update what will be committed)'));
        console.log(chalk_1.default.dim('  (use "gith checkout -- <file>..." to discard changes in working directory)\n'));
        status.modified.forEach(file => {
            if (file.endsWith(' (deleted)')) {
                console.log(chalk_1.default.red(`\tdeleted:    ${file.replace(' (deleted)', '')}`));
            }
            else {
                console.log(chalk_1.default.red(`\tmodified:   ${file}`));
            }
        });
        console.log();
    }
    if (status.untracked.length > 0) {
        console.log(chalk_1.default.red('Untracked files:'));
        console.log(chalk_1.default.dim('  (use "gith add <file>..." to include in what will be committed)\n'));
        status.untracked.forEach(file => {
            console.log(chalk_1.default.red(`\t${file}`));
        });
        console.log();
    }
}
//# sourceMappingURL=status.js.map