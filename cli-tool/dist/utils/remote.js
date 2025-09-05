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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteConfig = getRemoteConfig;
exports.setRemoteConfig = setRemoteConfig;
exports.removeRemoteConfig = removeRemoteConfig;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * Get the remote configuration from the local .gith/config
 */
async function getRemoteConfig(remoteName = 'origin') {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const configFile = path.join(githDir, 'config');
    if (!(await fs.pathExists(configFile))) {
        return null;
    }
    try {
        const configContent = await fs.readFile(configFile, 'utf-8');
        const lines = configContent.split('\n');
        let currentSection = '';
        let remoteUrl = '';
        let repositoryId = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                currentSection = trimmed.slice(1, -1);
            }
            else if (trimmed.includes('=')) {
                const [key, value] = trimmed.split('=').map(s => s.trim());
                if (currentSection === `remote "${remoteName}"`) {
                    if (key === 'url') {
                        remoteUrl = value;
                    }
                    else if (key === 'repositoryId') {
                        repositoryId = value;
                    }
                }
            }
        }
        if (remoteUrl) {
            return {
                name: remoteName,
                url: remoteUrl,
                repositoryId: repositoryId || undefined
            };
        }
        return null;
    }
    catch (error) {
        console.error('Error reading remote config:', error);
        return null;
    }
}
/**
 * Add or update a remote configuration
 */
async function setRemoteConfig(remoteName, url, repositoryId) {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const configFile = path.join(githDir, 'config');
    if (!(await fs.pathExists(configFile))) {
        throw new Error('Not a gith repository');
    }
    let configContent = await fs.readFile(configFile, 'utf-8');
    const lines = configContent.split('\n');
    // Check if remote already exists
    let remoteExists = false;
    let remoteSectionStart = -1;
    let remoteSectionEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === `[remote "${remoteName}"]`) {
            remoteExists = true;
            remoteSectionStart = i;
            // Find the end of this section
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim().startsWith('[')) {
                    remoteSectionEnd = j;
                    break;
                }
            }
            if (remoteSectionEnd === -1) {
                remoteSectionEnd = lines.length;
            }
            break;
        }
    }
    const remoteSection = [
        `[remote "${remoteName}"]`,
        `\turl = ${url}`
    ];
    if (repositoryId) {
        remoteSection.push(`\trepositoryId = ${repositoryId}`);
    }
    if (remoteExists) {
        // Replace existing remote section
        lines.splice(remoteSectionStart, remoteSectionEnd - remoteSectionStart, ...remoteSection);
    }
    else {
        // Add new remote section at the end
        if (lines[lines.length - 1] !== '') {
            lines.push('');
        }
        lines.push(...remoteSection);
    }
    await fs.writeFile(configFile, lines.join('\n') + '\n');
}
/**
 * Remove a remote configuration
 */
async function removeRemoteConfig(remoteName) {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const configFile = path.join(githDir, 'config');
    if (!(await fs.pathExists(configFile))) {
        throw new Error('Not a gith repository');
    }
    let configContent = await fs.readFile(configFile, 'utf-8');
    const lines = configContent.split('\n');
    // Find and remove the remote section
    let remoteSectionStart = -1;
    let remoteSectionEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === `[remote "${remoteName}"]`) {
            remoteSectionStart = i;
            // Find the end of this section
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim().startsWith('[')) {
                    remoteSectionEnd = j;
                    break;
                }
            }
            if (remoteSectionEnd === -1) {
                remoteSectionEnd = lines.length;
            }
            break;
        }
    }
    if (remoteSectionStart !== -1) {
        lines.splice(remoteSectionStart, remoteSectionEnd - remoteSectionStart);
        await fs.writeFile(configFile, lines.join('\n') + '\n');
    }
}
//# sourceMappingURL=remote.js.map