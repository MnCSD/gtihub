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
exports.initCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.initCommand = new commander_1.Command('init')
    .description('Create an empty Gith repository or reinitialize an existing one')
    .action(async () => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    try {
        // Check if .gith already exists
        if (await fs.pathExists(githDir)) {
            console.log(chalk_1.default.yellow('Reinitialized existing Gith repository in'), chalk_1.default.blue(githDir));
            return;
        }
        // Create .gith directory structure
        await fs.ensureDir(githDir);
        await fs.ensureDir(path.join(githDir, 'objects'));
        await fs.ensureDir(path.join(githDir, 'refs', 'heads'));
        await fs.ensureDir(path.join(githDir, 'refs', 'tags'));
        // Create HEAD file pointing to main branch
        await fs.writeFile(path.join(githDir, 'HEAD'), 'ref: refs/heads/main\n');
        // Create config file
        const config = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
\tlogallrefupdates = true
`;
        await fs.writeFile(path.join(githDir, 'config'), config);
        // Create description file
        await fs.writeFile(path.join(githDir, 'description'), 'Unnamed repository; edit this file \'description\' to name the repository.\n');
        // Hide the .gith directory on Windows
        if (process.platform === 'win32') {
            try {
                await execAsync(`attrib +H "${githDir}"`);
            }
            catch (hideError) {
                // If hiding fails, continue anyway
                console.warn(chalk_1.default.yellow('Warning: Could not hide .gith directory'));
            }
        }
        console.log(chalk_1.default.green('Initialized empty Gith repository in'), chalk_1.default.blue(githDir));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error initializing repository:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=init.js.map