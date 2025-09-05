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
    catch (error) {
        console.error(chalk_1.default.red('Error getting status:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=status.js.map