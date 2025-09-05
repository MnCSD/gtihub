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
exports.logCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
exports.logCommand = new commander_1.Command('log')
    .description('Show commit logs')
    .option('--oneline', 'show each commit on a single line')
    .option('-n, --max-count <number>', 'limit the number of commits to output')
    .option('--graph', 'show a text-based graphical representation')
    .action(async (options) => {
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
        const branchName = branchRef.split('/').pop() || 'main';
        const branchFile = path.join(githDir, branchRef);
        if (!(await fs.pathExists(branchFile))) {
            console.log(chalk_1.default.yellow('No commits yet'));
            return;
        }
        const currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();
        // Collect all commits in chronological order (newest first)
        const commits = [];
        const processedCommits = new Set();
        const collectCommits = async (commitSha) => {
            if (processedCommits.has(commitSha))
                return;
            processedCommits.add(commitSha);
            const commitDir = path.join(githDir, 'objects', commitSha.substring(0, 2));
            const commitFile = path.join(commitDir, commitSha.substring(2));
            if (!(await fs.pathExists(commitFile))) {
                return;
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
            // Parse author/committer timestamp
            const parseAuthorInfo = (authorLine) => {
                const match = authorLine.match(/^(.+) (\d+) ([\+\-]\d{4})$/);
                return match ? {
                    info: match[1],
                    timestamp: parseInt(match[2])
                } : {
                    info: authorLine,
                    timestamp: Date.now() / 1000
                };
            };
            const authorInfo = parseAuthorInfo(author);
            const committerInfo = parseAuthorInfo(committer);
            commits.push({
                sha: commitSha,
                message,
                author: authorInfo.info,
                committer: committerInfo.info,
                timestamp: authorInfo.timestamp,
                treeHash,
                parentSha,
                isHead: commitSha === currentCommitSha
            });
            // Recursively process parent commit
            if (parentSha) {
                await collectCommits(parentSha);
            }
        };
        await collectCommits(currentCommitSha);
        // Apply filters
        let filteredCommits = commits;
        if (options.maxCount) {
            const maxCount = parseInt(options.maxCount);
            filteredCommits = commits.slice(0, maxCount);
        }
        if (filteredCommits.length === 0) {
            console.log(chalk_1.default.yellow('No commits found'));
            return;
        }
        // Display commits
        for (let i = 0; i < filteredCommits.length; i++) {
            const commit = filteredCommits[i];
            if (options.oneline) {
                // Oneline format: sha (7 chars) + refs + message
                const shortSha = chalk_1.default.yellow(commit.sha.substring(0, 7));
                let headMarker = '';
                if (commit.isHead) {
                    const headText = chalk_1.default.cyan('HEAD');
                    const arrow = chalk_1.default.white(' -> ');
                    const branchText = chalk_1.default.green(branchName);
                    headMarker = ` (${headText}${arrow}${branchText})`;
                }
                console.log(`${shortSha}${headMarker} ${commit.message}`);
            }
            else {
                // Full format like Git with proper colors
                const shortSha = commit.sha.substring(0, 7);
                // HEAD and branch indicators with proper Git colors
                let refInfo = '';
                if (commit.isHead) {
                    const headText = chalk_1.default.cyan('HEAD');
                    const arrow = chalk_1.default.white(' -> ');
                    const branchText = chalk_1.default.green(branchName);
                    // Add origin branch if available (would be red)
                    const originText = chalk_1.default.red('origin/' + branchName);
                    refInfo = ` (${headText}${arrow}${branchText}, ${originText})`;
                }
                // Check if this is a merge commit
                const isMerge = commit.parentSha && commits.some(c => c.sha !== commit.sha && c.parentSha === commit.parentSha);
                let mergeInfo = '';
                if (isMerge && commit.parentSha) {
                    const parentShort = commit.parentSha.substring(0, 7);
                    mergeInfo = chalk_1.default.white(`\nMerge: ${parentShort} ${shortSha}`);
                }
                // Format exactly like Git: orange "commit" + yellow SHA + colored refs
                const commitText = chalk_1.default.hex('#ff8c00')('commit'); // Orange like Git
                const shaText = chalk_1.default.yellow(commit.sha);
                console.log(`${commitText} ${shaText}${refInfo}${mergeInfo}`);
                console.log(chalk_1.default.white(`Author: ${commit.author}`));
                // Format date like Git (e.g., "Fri Sep 5 16:36:07 2025 +0300")
                const date = new Date(commit.timestamp * 1000);
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dayName = dayNames[date.getDay()];
                const monthName = monthNames[date.getMonth()];
                const day = date.getDate();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                const year = date.getFullYear();
                // Simple timezone (you could make this more accurate)
                const timezoneOffset = -date.getTimezoneOffset();
                const tzHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
                const tzMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
                const tzSign = timezoneOffset >= 0 ? '+' : '-';
                const timezone = `${tzSign}${tzHours}${tzMinutes}`;
                const formattedDate = `${dayName} ${monthName} ${day} ${hours}:${minutes}:${seconds} ${year} ${timezone}`;
                console.log(chalk_1.default.white(`Date:   ${formattedDate}`));
                console.log('');
                // Indent commit message
                const messageLines = commit.message.split('\n');
                messageLines.forEach(line => {
                    console.log(`    ${line}`);
                });
                // Add spacing between commits (except for the last one)
                if (i < filteredCommits.length - 1) {
                    console.log('');
                }
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error displaying log:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=log.js.map