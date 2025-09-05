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
exports.commitCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
exports.commitCommand = new commander_1.Command('commit')
    .description('Record changes to the repository')
    .option('-m, --message <message>', 'commit message')
    .action(async (options) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');
    const headFile = path.join(githDir, 'HEAD');
    try {
        // Check if .gith repository exists
        if (!(await fs.pathExists(githDir))) {
            console.error(chalk_1.default.red('fatal: not a gith repository (or any of the parent directories): .gith'));
            process.exit(1);
        }
        // Check if there are staged changes
        if (!(await fs.pathExists(indexFile))) {
            console.log(chalk_1.default.yellow('nothing to commit, working tree clean'));
            return;
        }
        const indexContent = await fs.readFile(indexFile, 'utf-8');
        const index = JSON.parse(indexContent);
        if (Object.keys(index).length === 0) {
            console.log(chalk_1.default.yellow('nothing to commit, working tree clean'));
            return;
        }
        // Get commit message
        const message = options.message;
        if (!message) {
            console.error(chalk_1.default.red('error: no commit message provided'));
            console.log(chalk_1.default.yellow('use: gith commit -m "your commit message"'));
            process.exit(1);
        }
        // Create tree object from staged files
        const treeEntries = Object.keys(index).map(filePath => {
            const fileData = index[filePath];
            return `100644 blob ${fileData.hash}\t${filePath}`;
        }).sort().join('\n');
        const treeContent = `tree\n${treeEntries}\n`;
        const treeHash = crypto.createHash('sha1').update(treeContent).digest('hex');
        // Store tree object
        const treeDir = path.join(githDir, 'objects', treeHash.substring(0, 2));
        const treeFile = path.join(treeDir, treeHash.substring(2));
        await fs.ensureDir(treeDir);
        await fs.writeFile(treeFile, treeContent);
        // Get parent commit if exists
        let parentCommit;
        const headContent = await fs.readFile(headFile, 'utf-8');
        const branchRef = headContent.trim().replace('ref: ', '');
        const branchFile = path.join(githDir, branchRef);
        if (await fs.pathExists(branchFile)) {
            parentCommit = (await fs.readFile(branchFile, 'utf-8')).trim();
        }
        // Get author info from config
        const author = await getAuthorFromConfig(githDir);
        const timestamp = new Date().toISOString();
        const commitObj = {
            tree: treeHash,
            author: `${author} ${Math.floor(Date.now() / 1000)} +0000`,
            committer: `${author} ${Math.floor(Date.now() / 1000)} +0000`,
            message: message
        };
        if (parentCommit) {
            commitObj.parent = parentCommit;
        }
        // Create commit content in Git format
        let commitContent = `tree ${commitObj.tree}\n`;
        if (commitObj.parent) {
            commitContent += `parent ${commitObj.parent}\n`;
        }
        commitContent += `author ${commitObj.author}\n`;
        commitContent += `committer ${commitObj.committer}\n`;
        commitContent += `\n${commitObj.message}\n`;
        // Hash the commit
        const commitHash = crypto.createHash('sha1').update(`commit ${commitContent.length}\0${commitContent}`).digest('hex');
        // Store commit object
        const commitDir = path.join(githDir, 'objects', commitHash.substring(0, 2));
        const commitFile = path.join(commitDir, commitHash.substring(2));
        await fs.ensureDir(commitDir);
        await fs.writeFile(commitFile, commitContent);
        // Update branch reference
        await fs.ensureDir(path.dirname(branchFile));
        await fs.writeFile(branchFile, commitHash);
        // Clear the index (staging area)
        await fs.writeFile(indexFile, '{}');
        // Display commit message like Git
        const shortHash = commitHash.substring(0, 7);
        const filesChanged = Object.keys(index).length;
        const isInitial = !parentCommit;
        if (isInitial) {
            console.log(chalk_1.default.green(`[main (root-commit) ${shortHash}] ${message}`));
        }
        else {
            console.log(chalk_1.default.green(`[main ${shortHash}] ${message}`));
        }
        console.log(chalk_1.default.white(`${filesChanged} file${filesChanged !== 1 ? 's' : ''} changed`));
        // Show files that were committed
        Object.keys(index).forEach(filePath => {
            console.log(chalk_1.default.green(` create mode 100644 ${filePath}`));
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('Error creating commit:'), error);
        process.exit(1);
    }
});
async function getAuthorFromConfig(githDir) {
    // Try local config first, then global
    const localConfigFile = path.join(githDir, 'config');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const globalConfigFile = path.join(homeDir, '.githconfig');
    let name = 'Unknown User';
    let email = 'unknown@example.com';
    // Parse config files
    for (const configFile of [localConfigFile, globalConfigFile]) {
        if (await fs.pathExists(configFile)) {
            try {
                const configContent = await fs.readFile(configFile, 'utf-8');
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
                        if (key === 'name')
                            name = value;
                        if (key === 'email')
                            email = value;
                    }
                }
            }
            catch (e) {
                // Ignore config parsing errors
            }
        }
    }
    return `${name} <${email}>`;
}
//# sourceMappingURL=commit.js.map