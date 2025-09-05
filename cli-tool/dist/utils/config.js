"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureConfigDir = ensureConfigDir;
exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.setConfigValue = setConfigValue;
exports.getConfigValue = getConfigValue;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.mygit');
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
const DEFAULT_CONFIG = {
    user: {
        name: '',
        email: ''
    },
    remote: {
        origin: 'http://localhost:3000/api'
    },
    auth: {}
};
function ensureConfigDir() {
    fs_extra_1.default.ensureDirSync(CONFIG_DIR);
}
function getConfig() {
    ensureConfigDir();
    if (!fs_extra_1.default.existsSync(CONFIG_FILE)) {
        fs_extra_1.default.writeJsonSync(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
        return DEFAULT_CONFIG;
    }
    try {
        return fs_extra_1.default.readJsonSync(CONFIG_FILE);
    }
    catch (error) {
        return DEFAULT_CONFIG;
    }
}
function setConfig(config) {
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, ...config };
    ensureConfigDir();
    fs_extra_1.default.writeJsonSync(CONFIG_FILE, updatedConfig, { spaces: 2 });
}
function setConfigValue(key, value) {
    const config = getConfig();
    const keys = key.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(config);
}
function getConfigValue(key) {
    const config = getConfig();
    const keys = key.split('.');
    let current = config;
    for (const k of keys) {
        if (current[k] === undefined) {
            return undefined;
        }
        current = current[k];
    }
    return current;
}
//# sourceMappingURL=config.js.map