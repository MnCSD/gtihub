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
exports.pullCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const remote_1 = require("../utils/remote");
async function getGithConfigValue(key) {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    // Try local config first
    const localConfigFile = path.join(githDir, 'config');
    if (await fs.pathExists(localConfigFile)) {
        const configValue = await parseConfigFile(localConfigFile, key);
        if (configValue !== undefined)
            return configValue;
    }
    // Try global config
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const globalConfigFile = path.join(homeDir, '.githconfig');
    if (await fs.pathExists(globalConfigFile)) {
        return await parseConfigFile(globalConfigFile, key);
    }
    return undefined;
}
async function parseConfigFile(configFile, searchKey) {
    const configContent = await fs.readFile(configFile, 'utf-8');
    const lines = configContent.split('\n');
    let currentSection = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            currentSection = trimmed.slice(1, -1);
        }
        else if (trimmed.includes('=')) {
            const [configKey, configValue] = trimmed.split('=').map(s => s.trim());
            const fullKey = currentSection ? `${currentSection}.${configKey}` : configKey;
            if (fullKey === searchKey) {
                return configValue;
            }
        }
    }
    return undefined;
}
exports.pullCommand = new commander_1.Command('pull')
    .description('Fetch from and integrate with another repository or a local branch')
    .argument('[remote]', 'remote name', 'origin')
    .argument('[branch]', 'branch name')
    .action(async (remoteName, branchName) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const headFile = path.join(githDir, 'HEAD');
    try {
        // Check if .gith repository exists
        if (!(await fs.pathExists(githDir))) {
            console.error(chalk_1.default.red('fatal: not a gith repository (or any of the parent directories): .gith'));
            process.exit(1);
        }
        // Get current branch
        const headContent = await fs.readFile(headFile, 'utf-8');
        const branchRef = headContent.trim().replace('ref: ', '');
        const currentBranch = branchRef.split('/').pop() || 'main';
        const targetBranch = branchName || currentBranch;
        const branchFile = path.join(githDir, branchRef);
        // Get remote configuration
        const remote = await (0, remote_1.getRemoteConfig)(remoteName || 'origin');
        if (!remote) {
            console.error(chalk_1.default.red(`fatal: no remote configured for '${remoteName || 'origin'}'`));
            console.log(chalk_1.default.yellow('Hint: Run "gith remote add origin <url>" to add a remote'));
            process.exit(1);
        }
        // Extract repository info from URL or use stored repositoryId
        let repositoryId = remote.repositoryId;
        if (!repositoryId && remote.username && remote.repoName) {
            repositoryId = `${remote.username}/${remote.repoName}`;
        }
        if (!repositoryId) {
            console.error(chalk_1.default.red('fatal: unable to determine repository from remote URL'));
            console.log(chalk_1.default.yellow('Hint: Use format https://localhost:3000/{username}/{reponame}'));
            process.exit(1);
        }
        // Get current commit SHA (if any)
        let currentCommitSha;
        if (await fs.pathExists(branchFile)) {
            currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();
        }
        // Convert web URL to API URL
        const apiUrl = (0, remote_1.getApiUrl)(remote.url);
        const encodedRepositoryId = encodeURIComponent(repositoryId);
        // Get user email for authentication
        const userEmail = await getGithConfigValue('user.email');
        console.log(chalk_1.default.blue('Fetching from'), chalk_1.default.yellow(remote.url));
        // Fetch new commits from the remote
        const endpoint = `${apiUrl}/repositories/${encodedRepositoryId}/pull`;
        try {
            const response = await axios_1.default.post(endpoint, {
                branch: targetBranch,
                currentCommit: currentCommitSha,
                userEmail: userEmail
            });
            const pullData = response.data;
            if (!pullData.hasNewCommits) {
                console.log(chalk_1.default.green('Already up to date.'));
                return;
            }
            console.log(chalk_1.default.blue(`Fetching ${pullData.newCommitsCount} new commit${pullData.newCommitsCount !== 1 ? 's' : ''}...`));
            // Store new commit objects
            for (const commit of pullData.commits) {
                // Create commit object
                let commitContent = `tree ${commit.treeHash}\n`;
                if (commit.parentSha) {
                    commitContent += `parent ${commit.parentSha}\n`;
                }
                commitContent += `author ${commit.author.name} <${commit.author.email}> ${Math.floor(new Date(commit.timestamp).getTime() / 1000)} +0000\n`;
                commitContent += `committer ${commit.committer.name} <${commit.committer.email}> ${Math.floor(new Date(commit.timestamp).getTime() / 1000)} +0000\n`;
                commitContent += `\n${commit.message}\n`;
                // Store commit object
                const commitDir = path.join(githDir, 'objects', commit.sha.substring(0, 2));
                const commitFile = path.join(commitDir, commit.sha.substring(2));
                await fs.ensureDir(commitDir);
                await fs.writeFile(commitFile, commitContent);
                // Create tree object
                const treeEntries = commit.files.map(file => {
                    return `${file.mode} blob ${file.hash}\t${file.path}`;
                }).sort().join('\n');
                const treeContent = `tree\n${treeEntries}\n`;
                const treeDir = path.join(githDir, 'objects', commit.treeHash.substring(0, 2));
                const treeFile = path.join(treeDir, commit.treeHash.substring(2));
                await fs.ensureDir(treeDir);
                await fs.writeFile(treeFile, treeContent);
                // Store file objects
                for (const file of commit.files) {
                    const objectDir = path.join(githDir, 'objects', file.hash.substring(0, 2));
                    const objectFile = path.join(objectDir, file.hash.substring(2));
                    await fs.ensureDir(objectDir);
                    await fs.writeFile(objectFile, file.content);
                }
            }
            // Update branch reference to point to the new head
            if (pullData.headCommit) {
                await fs.writeFile(branchFile, pullData.headCommit);
                // Update working directory with the latest commit's files
                const headCommit = pullData.commits.find(c => c.sha === pullData.headCommit);
                if (headCommit) {
                    console.log(chalk_1.default.blue('Updating files in working directory...'));
                    // Get list of current files (excluding .gith directory)
                    const currentFiles = new Set();
                    const getAllFiles = async (dir, relativePath = '') => {
                        const items = await fs.readdir(dir);
                        for (const item of items) {
                            if (item === '.gith')
                                continue; // Skip .gith directory
                            const fullPath = path.join(dir, item);
                            const relativeFile = relativePath ? path.join(relativePath, item) : item;
                            const stat = await fs.stat(fullPath);
                            if (stat.isDirectory()) {
                                await getAllFiles(fullPath, relativeFile);
                            }
                            else {
                                currentFiles.add(relativeFile.replace(/\\/g, '/'));
                            }
                        }
                    };
                    await getAllFiles(currentDir);
                    // Track which files are in the new commit
                    const newFiles = new Set();
                    // Update/create files from the head commit
                    for (const file of headCommit.files) {
                        newFiles.add(file.path);
                        const filePath = path.join(currentDir, file.path);
                        await fs.ensureDir(path.dirname(filePath));
                        await fs.writeFile(filePath, file.content);
                    }
                    // Remove files that are no longer in the repository
                    for (const currentFile of currentFiles) {
                        if (!newFiles.has(currentFile)) {
                            const filePath = path.join(currentDir, currentFile);
                            if (await fs.pathExists(filePath)) {
                                await fs.remove(filePath);
                                console.log(chalk_1.default.gray(`Removed: ${currentFile}`));
                            }
                        }
                    }
                }
                const shortOldSha = currentCommitSha ? currentCommitSha.substring(0, 7) : '0000000';
                const shortNewSha = pullData.headCommit.substring(0, 7);
                console.log(chalk_1.default.green('Updating'), chalk_1.default.yellow(`${shortOldSha}..${shortNewSha}`), chalk_1.default.green('Fast-forward'));
                console.log(chalk_1.default.green(`✓ Successfully pulled ${pullData.newCommitsCount} commit${pullData.newCommitsCount !== 1 ? 's' : ''}`));
                if (headCommit) {
                    console.log(chalk_1.default.gray(`HEAD is now at ${shortNewSha} ${headCommit.message.split('\n')[0]}`));
                }
            }
        }
        catch (error) {
            if (error.response) {
                console.error(chalk_1.default.red('Pull failed:'), error.response.data.error || error.response.statusText);
                if (error.response.status === 401) {
                    console.log(chalk_1.default.yellow('Hint: Make sure you are authenticated to the remote repository'));
                }
                else if (error.response.status === 404) {
                    console.log(chalk_1.default.yellow('Hint: Make sure the repository and branch exist'));
                }
            }
            else if (error.request) {
                console.error(chalk_1.default.red('Pull failed: Unable to connect to remote repository'));
                console.log(chalk_1.default.yellow(`Hint: Check if ${apiUrl} is accessible`));
            }
            else {
                console.error(chalk_1.default.red('Pull failed:'), error.message);
            }
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error during pull:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=pull.js.map