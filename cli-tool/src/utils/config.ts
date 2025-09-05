import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { GitConfig } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.mygit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: GitConfig = {
  user: {
    name: '',
    email: ''
  },
  remote: {
    origin: 'http://localhost:3000/api'
  },
  auth: {}
};

export function ensureConfigDir(): void {
  fs.ensureDirSync(CONFIG_DIR);
}

export function getConfig(): GitConfig {
  ensureConfigDir();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeJsonSync(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
    return DEFAULT_CONFIG;
  }

  try {
    return fs.readJsonSync(CONFIG_FILE);
  } catch (error) {
    return DEFAULT_CONFIG;
  }
}

export function setConfig(config: Partial<GitConfig>): void {
  const currentConfig = getConfig();
  const updatedConfig = { ...currentConfig, ...config };
  
  ensureConfigDir();
  fs.writeJsonSync(CONFIG_FILE, updatedConfig, { spaces: 2 });
}

export function setConfigValue(key: string, value: any): void {
  const config = getConfig();
  const keys = key.split('.');
  
  let current: any = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  setConfig(config);
}

export function getConfigValue(key: string): any {
  const config = getConfig();
  const keys = key.split('.');
  
  let current: any = config;
  for (const k of keys) {
    if (current[k] === undefined) {
      return undefined;
    }
    current = current[k];
  }
  
  return current;
}