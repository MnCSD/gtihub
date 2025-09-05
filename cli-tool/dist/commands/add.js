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
exports.addCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
exports.addCommand = new commander_1.Command('add')
    .description('Add file contents to the index')
    .argument('<files...>', 'Files to add to the staging area')
    .action(async (files) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const indexFile = path.join(githDir, 'index');
    try {
        // Check if .gith repository exists
        if (!(await fs.pathExists(githDir))) {
            console.error(chalk_1.default.red('fatal: not a gith repository (or any of the parent directories): .gith'));
            process.exit(1);
        }
        // Load existing index or create empty one
        let index = {};
        if (await fs.pathExists(indexFile)) {
            const indexContent = await fs.readFile(indexFile, 'utf-8');
            index = JSON.parse(indexContent);
        }
        for (const file of files) {
            const filePath = path.resolve(currentDir, file);
            // Check if file exists
            if (!(await fs.pathExists(filePath))) {
                console.error(chalk_1.default.red(`fatal: pathspec '${file}' did not match any files`));
                continue;
            }
            // Check if it's a file (not directory)
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) {
                console.error(chalk_1.default.yellow(`warning: '${file}' is not a regular file, skipping`));
                continue;
            }
            // Read file content and create hash
            const content = await fs.readFile(filePath);
            const hash = crypto.createHash('sha1').update(content).digest('hex');
            // Store object in objects directory
            const objectDir = path.join(githDir, 'objects', hash.substring(0, 2));
            const objectFile = path.join(objectDir, hash.substring(2));
            await fs.ensureDir(objectDir);
            await fs.writeFile(objectFile, content);
            // Add to index
            const relativePath = path.relative(currentDir, filePath);
            index[relativePath] = {
                hash: hash,
                mode: '100644',
                size: content.length,
                mtime: stat.mtime.getTime()
            };
            console.log(chalk_1.default.green(`Added '${relativePath}' to staging area`));
        }
        // Save updated index
        await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error adding files:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=add.js.map