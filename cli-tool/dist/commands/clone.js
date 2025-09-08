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
exports.cloneCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const remote_1 = require("../utils/remote");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.cloneCommand = new commander_1.Command('clone')
    .description('Clone a repository into a new directory')
    .argument('<url>', 'repository URL (e.g., https://localhost:3000/username/reponame)')
    .argument('[directory]', 'directory name (defaults to repository name)')
    .action(async (url, directory) => {
    try {
        console.log(chalk_1.default.blue('Cloning repository...'));
        // Parse the web URL to extract username and repo name
        const parsed = (0, remote_1.parseWebUrl)(url);
        if (!parsed) {
            console.error(chalk_1.default.red('fatal: invalid repository URL format'));
            console.log(chalk_1.default.yellow('Expected format: https://localhost:3000/username/reponame'));
            process.exit(1);
        }
        const { username, repoName, baseUrl } = parsed;
        const repositoryId = `${username}/${repoName}`;
        // Get user email from global config for authentication
        let userEmail = 'mnikolopoylos@gmail.com'; // Default fallback
        try {
            const homeDir = process.env.HOME || process.env.USERPROFILE || '';
            const globalConfigFile = path.join(homeDir, '.githconfig');
            if (await fs.pathExists(globalConfigFile)) {
                const configContent = await fs.readFile(globalConfigFile, 'utf-8');
                const lines = configContent.split('\n');
                let inUserSection = false;
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '[user]') {
                        inUserSection = true;
                    }
                    else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                        inUserSection = false;
                    }
                    else if (inUserSection && trimmed.includes('=')) {
                        const [key, value] = trimmed.split('=').map(s => s.trim());
                        if (key === 'email') {
                            userEmail = value;
                            break;
                        }
                    }
                }
            }
        }
        catch (e) {
            // Use default email if config reading fails
        }
        console.log(chalk_1.default.gray(`Fetching repository data for '${repositoryId}' from ${baseUrl}...`));
        // Convert to API URL and fetch repository data
        const apiUrl = (0, remote_1.getApiUrl)(url);
        console.log(chalk_1.default.gray(`Using user email: ${userEmail}`));
        // Use the clone endpoint that works with user email
        const response = await axios_1.default.post(`${apiUrl}/repositories/${repositoryId}/clone`, {
            userEmail
        });
        const cloneData = response.data;
        // Determine directory name
        const targetDir = directory || cloneData.repository.name;
        const targetPath = path.resolve(process.cwd(), targetDir);
        // Check if directory already exists
        if (await fs.pathExists(targetPath)) {
            console.error(chalk_1.default.red(`fatal: destination path '${targetDir}' already exists and is not an empty directory.`));
            process.exit(1);
        }
        console.log(chalk_1.default.gray(`Creating directory '${targetDir}'...`));
        await fs.ensureDir(targetPath);
        // Create .gith directory structure
        const githDir = path.join(targetPath, '.gith');
        await fs.ensureDir(githDir);
        await fs.ensureDir(path.join(githDir, 'objects'));
        await fs.ensureDir(path.join(githDir, 'refs', 'heads'));
        await fs.ensureDir(path.join(githDir, 'refs', 'tags'));
        // Create HEAD file
        await fs.writeFile(path.join(githDir, 'HEAD'), `ref: refs/heads/${cloneData.defaultBranch}\n`);
        // Create config file (basic config, remote will be added later)
        const config = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
\tlogallrefupdates = true
`;
        await fs.writeFile(path.join(githDir, 'config'), config);
        // Create description file
        await fs.writeFile(path.join(githDir, 'description'), cloneData.repository.description || `Repository cloned from ${url}\n`);
        console.log(chalk_1.default.gray(`Recreating ${cloneData.commits.length} commits...`));
        // Recreate commits in chronological order
        for (const commit of cloneData.commits) {
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
        // Create branch references
        for (const branch of cloneData.branches) {
            if (branch.commitSha) {
                const branchFile = path.join(githDir, 'refs', 'heads', branch.name);
                await fs.writeFile(branchFile, branch.commitSha);
            }
        }
        // Checkout the default branch (recreate working directory)
        if (cloneData.headCommit) {
            console.log(chalk_1.default.gray(`Checking out '${cloneData.defaultBranch}'...`));
            // Find the head commit
            const headCommit = cloneData.commits.find(c => c.sha === cloneData.headCommit);
            if (headCommit) {
                // Recreate files in working directory
                for (const file of headCommit.files) {
                    const filePath = path.join(targetPath, file.path);
                    await fs.ensureDir(path.dirname(filePath));
                    await fs.writeFile(filePath, file.content);
                }
            }
        }
        // Set up remote configuration
        console.log(chalk_1.default.gray('Setting up remote origin...'));
        process.chdir(targetPath); // Change to the cloned directory
        await (0, remote_1.setRemoteConfig)('origin', url, repositoryId);
        // Hide .gith directory on Windows
        if (process.platform === 'win32') {
            try {
                await execAsync(`attrib +H "${githDir}"`);
            }
            catch (hideError) {
                // If hiding fails, continue anyway
            }
        }
        console.log(chalk_1.default.green(`✓ Repository cloned successfully into '${targetDir}'`));
        console.log(chalk_1.default.gray(`  ${cloneData.commits.length} commits`));
        console.log(chalk_1.default.gray(`  ${cloneData.branches.length} branch${cloneData.branches.length !== 1 ? 'es' : ''}`));
        console.log(chalk_1.default.gray(`  HEAD is now at ${cloneData.headCommit?.substring(0, 7)} on ${cloneData.defaultBranch}`));
    }
    catch (error) {
        if (error.response) {
            console.error(chalk_1.default.red('Clone failed:'), error.response.data.error || error.response.statusText);
            if (error.response.status === 404) {
                console.log(chalk_1.default.yellow('Hint: Make sure the repository exists and you have access to it'));
            }
        }
        else if (error.request) {
            console.error(chalk_1.default.red('Clone failed: Unable to connect to remote repository'));
            console.log(chalk_1.default.yellow('Hint: Check your internet connection and repository URL'));
        }
        else {
            console.error(chalk_1.default.red('Clone failed:'), error.message);
        }
        process.exit(1);
    }
});
//# sourceMappingURL=clone.js.map