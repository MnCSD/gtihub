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
exports.pushCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const remote_1 = require("../utils/remote");
exports.pushCommand = new commander_1.Command('push')
    .description('Update remote refs along with associated objects')
    .argument('[remote]', 'remote name', 'origin')
    .argument('[branch]', 'branch name')
    .option('-u, --set-upstream', 'set upstream for git pull/status')
    .action(async (remoteName, branchName, options) => {
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
        if (!(await fs.pathExists(branchFile))) {
            console.error(chalk_1.default.red('fatal: no commits to push'));
            process.exit(1);
        }
        const currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();
        // Get remote configuration
        const remote = await (0, remote_1.getRemoteConfig)(remoteName || 'origin');
        if (!remote) {
            console.error(chalk_1.default.red(`fatal: no remote configured for '${remoteName || 'origin'}'`));
            console.log(chalk_1.default.yellow('Hint: Run "gith remote add origin <url>" to add a remote'));
            process.exit(1);
        }
        if (!remote.repositoryId) {
            console.error(chalk_1.default.red('fatal: no repository ID configured for remote'));
            console.log(chalk_1.default.yellow('Hint: Run "gith remote set-url origin <url> -r <repository-id>" to set repository ID'));
            process.exit(1);
        }
        const useTestEndpoint = process.env.GITH_USE_TEST_ENDPOINT === 'true';
        const endpoint = useTestEndpoint
            ? `${remote.url}/test-push`
            : `${remote.url}/repositories/${remote.repositoryId}/commits`;
        console.log(chalk_1.default.blue('Pushing to'), chalk_1.default.yellow(endpoint));
        // Collect all commits to push (walk back from current commit)
        const commitsToSend = [];
        const processedCommits = new Set();
        const collectCommits = async (commitSha) => {
            if (processedCommits.has(commitSha))
                return;
            processedCommits.add(commitSha);
            const commitDir = path.join(githDir, 'objects', commitSha.substring(0, 2));
            const commitFile = path.join(commitDir, commitSha.substring(2));
            if (!(await fs.pathExists(commitFile))) {
                console.error(chalk_1.default.red(`fatal: commit object ${commitSha} not found`));
                process.exit(1);
            }
            const commitContent = await fs.readFile(commitFile, 'utf-8');
            const lines = commitContent.split('\n');
            let treeHash = '';
            let parentSha;
            let author = '';
            let committer = '';
            let messageStart = 0;
            // Parse commit object
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('tree ')) {
                    treeHash = line.substring(5);
                }
                else if (line.startsWith('parent ')) {
                    parentSha = line.substring(7);
                }
                else if (line.startsWith('author ')) {
                    author = line.substring(7);
                }
                else if (line.startsWith('committer ')) {
                    committer = line.substring(10);
                }
                else if (line === '') {
                    messageStart = i + 1;
                    break;
                }
            }
            const message = lines.slice(messageStart).join('\n').trim();
            // Parse author/committer info
            const parseAuthorInfo = (authorLine) => {
                const match = authorLine.match(/^(.+) <(.+)> (\d+) ([\+\-]\d{4})$/);
                return match ? {
                    name: match[1],
                    email: match[2],
                    timestamp: new Date(parseInt(match[3]) * 1000).toISOString()
                } : {
                    name: 'Unknown',
                    email: 'unknown@example.com',
                    timestamp: new Date().toISOString()
                };
            };
            const authorInfo = parseAuthorInfo(author);
            const committerInfo = parseAuthorInfo(committer);
            // Get files from tree by parsing commit and finding all objects
            const files = [];
            // Parse the tree object to get files
            const treeDir = path.join(githDir, 'objects', treeHash.substring(0, 2));
            const treeFile = path.join(treeDir, treeHash.substring(2));
            if (await fs.pathExists(treeFile)) {
                try {
                    const treeContent = await fs.readFile(treeFile, 'utf-8');
                    const treeLines = treeContent.split('\n').filter(line => line.trim());
                    // Skip the first line which is "tree"
                    for (let i = 1; i < treeLines.length; i++) {
                        const line = treeLines[i];
                        if (line.includes('\t')) {
                            const [modeAndHash, filePath] = line.split('\t');
                            const parts = modeAndHash.split(' ');
                            if (parts.length >= 3) {
                                const mode = parts[0];
                                const hash = parts[2];
                                // Read file content from objects
                                const objectDir = path.join(githDir, 'objects', hash.substring(0, 2));
                                const objectFile = path.join(objectDir, hash.substring(2));
                                if (await fs.pathExists(objectFile)) {
                                    const content = await fs.readFile(objectFile, 'utf-8');
                                    files.push({
                                        path: filePath,
                                        content,
                                        hash: hash,
                                        mode: mode,
                                        action: 'added'
                                    });
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn('Could not parse tree object for commit', commitSha);
                    // Fallback: try to get files from working directory
                    const allFiles = await fs.readdir(currentDir);
                    for (const file of allFiles) {
                        if (file.startsWith('.'))
                            continue; // Skip hidden files
                        const filePath = path.join(currentDir, file);
                        const stat = await fs.stat(filePath);
                        if (stat.isFile()) {
                            const content = await fs.readFile(filePath, 'utf-8');
                            const hash = crypto.createHash('sha1').update(content).digest('hex');
                            files.push({
                                path: file,
                                content,
                                hash,
                                mode: '100644',
                                action: 'added'
                            });
                        }
                    }
                }
            }
            const commitData = {
                sha: commitSha,
                message,
                author: {
                    name: authorInfo.name,
                    email: authorInfo.email
                },
                committer: {
                    name: committerInfo.name,
                    email: committerInfo.email
                },
                timestamp: authorInfo.timestamp,
                treeHash,
                parentSha,
                files
            };
            commitsToSend.unshift(commitData); // Add to beginning for correct order
            // Recursively process parent commit
            if (parentSha) {
                await collectCommits(parentSha);
            }
        };
        await collectCommits(currentCommitSha);
        if (commitsToSend.length === 0) {
            console.log(chalk_1.default.yellow('Everything up-to-date'));
            return;
        }
        // Send commits to API
        try {
            // For testing, you can set this environment variable with a session token
            const authToken = process.env.GITH_AUTH_TOKEN;
            const headers = {
                'Content-Type': 'application/json'
            };
            // Add auth header if token is provided
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            const requestData = useTestEndpoint
                ? { repositoryId: remote.repositoryId, commits: commitsToSend, branch: targetBranch }
                : { commits: commitsToSend, branch: targetBranch };
            const response = await axios_1.default.post(endpoint, requestData, { headers });
            const { commitsCreated } = response.data;
            console.log(chalk_1.default.green('To'), chalk_1.default.yellow(`${remote.url}/repositories/${remote.repositoryId}`));
            if (commitsCreated > 0) {
                const shortSha = currentCommitSha.substring(0, 7);
                console.log(chalk_1.default.green(`   ${shortSha}..${shortSha}  ${targetBranch} -> ${targetBranch}`));
                console.log(chalk_1.default.green(`✓ Successfully pushed ${commitsCreated} commit${commitsCreated !== 1 ? 's' : ''}`));
            }
            else {
                console.log(chalk_1.default.yellow('Everything up-to-date'));
            }
        }
        catch (error) {
            if (error.response) {
                console.error(chalk_1.default.red('Push failed:'), error.response.data.error || error.response.statusText);
                if (error.response.status === 401) {
                    console.log(chalk_1.default.yellow('Hint: Make sure you are authenticated to the remote repository'));
                }
            }
            else if (error.request) {
                console.error(chalk_1.default.red('Push failed: Unable to connect to remote repository'));
                console.log(chalk_1.default.yellow(`Hint: Check if ${remote.url} is accessible`));
            }
            else {
                console.error(chalk_1.default.red('Push failed:'), error.message);
            }
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error during push:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=push.js.map