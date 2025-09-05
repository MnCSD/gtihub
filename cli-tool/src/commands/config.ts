import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';

interface GitConfig {
  'user.name'?: string;
  'user.email'?: string;
  [key: string]: string | undefined;
}

export const configCommand = new Command('config')
  .description('Get and set repository or global options')
  .option('--global', 'use global config file')
  .option('--list', 'list all config options')
  .argument('[key]', 'configuration key')
  .argument('[value]', 'configuration value')
  .action(async (key?: string, value?: string, options?: any) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    
    try {
      // Determine config file location
      const isGlobal = options?.global;
      let configFile: string;
      
      if (isGlobal) {
        // Global config in user home directory
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        configFile = path.join(homeDir, '.githconfig');
      } else {
        // Local config in repository
        if (!(await fs.pathExists(githDir))) {
          console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
          process.exit(1);
        }
        configFile = path.join(githDir, 'config');
      }

      // Load existing config
      let config: GitConfig = {};
      if (await fs.pathExists(configFile)) {
        const configContent = await fs.readFile(configFile, 'utf-8');
        
        // Parse simple INI-like format
        const lines = configContent.split('\n');
        let currentSection = '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            currentSection = trimmed.slice(1, -1);
          } else if (trimmed.includes('=')) {
            const [configKey, configValue] = trimmed.split('=').map(s => s.trim());
            const fullKey = currentSection ? `${currentSection}.${configKey}` : configKey;
            config[fullKey] = configValue;
          }
        }
      }

      // Handle different operations
      if (options?.list) {
        // List all configuration
        console.log(chalk.blue(isGlobal ? 'Global configuration:' : 'Repository configuration:'));
        for (const [key, value] of Object.entries(config)) {
          console.log(`${chalk.green(key)}=${value}`);
        }
        return;
      }

      if (!key) {
        console.error(chalk.red('error: key is required'));
        console.log(chalk.yellow('usage: gith config [--global] <key> [<value>]'));
        console.log(chalk.yellow('   or: gith config [--global] --list'));
        process.exit(1);
      }

      if (value !== undefined) {
        // Set configuration
        config[key] = value;
        
        // Write back to file
        await writeConfig(configFile, config);
        
        console.log(chalk.green(`Set ${key} = ${value}${isGlobal ? ' (global)' : ''}`));
      } else {
        // Get configuration - check local first, then global
        let configValue = config[key];
        
        // If not found locally and not using global flag, check global config
        if (configValue === undefined && !isGlobal) {
          const homeDir = process.env.HOME || process.env.USERPROFILE || '';
          const globalConfigFile = path.join(homeDir, '.githconfig');
          
          if (await fs.pathExists(globalConfigFile)) {
            const globalConfig: GitConfig = {};
            const configContent = await fs.readFile(globalConfigFile, 'utf-8');
            
            // Parse global config
            const lines = configContent.split('\n');
            let currentSection = '';
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                currentSection = trimmed.slice(1, -1);
              } else if (trimmed.includes('=')) {
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
        } else {
          console.error(chalk.red(`error: key '${key}' not found`));
          process.exit(1);
        }
      }

    } catch (error) {
      console.error(chalk.red('Error accessing config:'), error);
      process.exit(1);
    }
  });

async function writeConfig(configFile: string, config: GitConfig): Promise<void> {
  // Group config by section
  const sections: Record<string, Record<string, string>> = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) continue;
    
    const parts = key.split('.');
    if (parts.length >= 2) {
      const section = parts[0];
      const configKey = parts.slice(1).join('.');
      
      if (!sections[section]) {
        sections[section] = {};
      }
      sections[section][configKey] = value;
    } else {
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
    } else if (!sectionName) {
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