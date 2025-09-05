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
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
exports.configCommand = new commander_1.Command('config')
    .description('Get and set repository or global options')
    .option('--global', 'use global config file')
    .option('--list', 'list all config options')
    .argument('[key]', 'configuration key')
    .argument('[value]', 'configuration value')
    .action(async (key, value, options) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    try {
        // Determine config file location
        const isGlobal = options?.global;
        let configFile;
        if (isGlobal) {
            // Global config in user home directory
            const homeDir = process.env.HOME || process.env.USERPROFILE || '';
            configFile = path.join(homeDir, '.githconfig');
        }
        else {
            // Local config in repository
            if (!(await fs.pathExists(githDir))) {
                console.error(chalk_1.default.red('fatal: not a gith repository (or any of the parent directories): .gith'));
                process.exit(1);
            }
            configFile = path.join(githDir, 'config');
        }
        // Load existing config
        let config = {};
        if (await fs.pathExists(configFile)) {
            const configContent = await fs.readFile(configFile, 'utf-8');
            // Parse simple INI-like format
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
                    config[fullKey] = configValue;
                }
            }
        }
        // Handle different operations
        if (options?.list) {
            // List all configuration
            console.log(chalk_1.default.blue(isGlobal ? 'Global configuration:' : 'Repository configuration:'));
            for (const [key, value] of Object.entries(config)) {
                console.log(`${chalk_1.default.green(key)}=${value}`);
            }
            return;
        }
        if (!key) {
            console.error(chalk_1.default.red('error: key is required'));
            console.log(chalk_1.default.yellow('usage: gith config [--global] <key> [<value>]'));
            console.log(chalk_1.default.yellow('   or: gith config [--global] --list'));
            process.exit(1);
        }
        if (value !== undefined) {
            // Set configuration
            config[key] = value;
            // Write back to file
            await writeConfig(configFile, config);
            console.log(chalk_1.default.green(`Set ${key} = ${value}${isGlobal ? ' (global)' : ''}`));
        }
        else {
            // Get configuration - check local first, then global
            let configValue = config[key];
            // If not found locally and not using global flag, check global config
            if (configValue === undefined && !isGlobal) {
                const homeDir = process.env.HOME || process.env.USERPROFILE || '';
                const globalConfigFile = path.join(homeDir, '.githconfig');
                if (await fs.pathExists(globalConfigFile)) {
                    const globalConfig = {};
                    const configContent = await fs.readFile(globalConfigFile, 'utf-8');
                    // Parse global config
                    const lines = configContent.split('\n');
                    let currentSection = '';
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                            currentSection = trimmed.slice(1, -1);
                        }
                        else if (trimmed.includes('=')) {
                            const [configKey, configValueStr] = trimmed.split('=').map(s => s.trim());
                            const fullKey = currentSection ? `${currentSection}.${configKey}` : configKey;
                            globalConfig[fullKey] = configValueStr;
                        }
                    }
                    configValue = globalConfig[key];
                }
            }
            if (configValue !== undefined) {
                console.log(configValue);
            }
            else {
                console.error(chalk_1.default.red(`error: key '${key}' not found`));
                process.exit(1);
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error accessing config:'), error);
        process.exit(1);
    }
});
async function writeConfig(configFile, config) {
    // Group config by section
    const sections = {};
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined)
            continue;
        const parts = key.split('.');
        if (parts.length >= 2) {
            const section = parts[0];
            const configKey = parts.slice(1).join('.');
            if (!sections[section]) {
                sections[section] = {};
            }
            sections[section][configKey] = value;
        }
        else {
            // Handle keys without sections
            if (!sections['']) {
                sections[''] = {};
            }
            sections[''][key] = value;
        }
    }
    // Write INI-like format
    let content = '';
    for (const [sectionName, sectionConfig] of Object.entries(sections)) {
        if (sectionName && Object.keys(sectionConfig).length > 0) {
            content += `[${sectionName}]\n`;
            for (const [key, value] of Object.entries(sectionConfig)) {
                content += `\t${key} = ${value}\n`;
            }
            content += '\n';
        }
        else if (!sectionName) {
            // Keys without sections
            for (const [key, value] of Object.entries(sectionConfig)) {
                content += `${key} = ${value}\n`;
            }
            content += '\n';
        }
    }
    await fs.ensureDir(path.dirname(configFile));
    await fs.writeFile(configFile, content.trim() + '\n');
}
//# sourceMappingURL=config.js.map