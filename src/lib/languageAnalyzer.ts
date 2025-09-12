import path from 'path';
import { getLanguageColor } from './languageColors';

export interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
  fileCount: number;
  totalLines: number;
}

// File extension to language mapping
const extensionToLanguage: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.py': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.c': 'C',
  '.cs': 'C#',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.rs': 'Rust',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'Sass',
  '.less': 'Less',
  '.html': 'HTML',
  '.xml': 'XML',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.fish': 'Shell',
  '.ps1': 'PowerShell',
  '.dockerfile': 'Dockerfile',
  '.r': 'R',
  '.m': 'Objective-C',
  '.mm': 'Objective-C++',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.dart': 'Dart',
  '.lua': 'Lua',
  '.pl': 'Perl',
  '.clj': 'Clojure',
  '.elm': 'Elm',
  '.ex': 'Elixir',
  '.exs': 'Elixir',
  '.erl': 'Erlang',
  '.hrl': 'Erlang',
  '.fs': 'F#',
  '.fsx': 'F#',
  '.ml': 'OCaml',
  '.mli': 'OCaml',
  '.hs': 'Haskell',
  '.lhs': 'Haskell',
  '.nim': 'Nim',
  '.jl': 'Julia',
  '.zig': 'Zig',
  '.v': 'V',
};

// Directories to ignore during scanning
const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  'coverage',
  '.nyc_output',
  'public',
  'assets',
  'static',
  '.vscode',
  '.idea',
  '__pycache__',
  '.pytest_cache',
  'venv',
  'env',
  '.env',
  'target',
  'bin',
  'obj',
  'logs',
  'tmp',
  'temp',
  '.DS_Store',
  'Thumbs.db'
]);

// Files to ignore
const ignoredFiles = new Set([
  '.gitignore',
  '.gitattributes',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Cargo.lock',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md'
]);

// For file system analysis (kept for compatibility)
function countLinesInFile(filePath: string): number {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

// For repository file content analysis
function countLinesInContent(content: string): number {
  if (!content) return 0;
  return content.split('\n').length;
}

// Count meaningful lines (excluding empty lines and comments for better balance)
function countMeaningfulLines(content: string, language: string): number {
  if (!content) return 0;
  
  const lines = content.split('\n');
  let meaningfulLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue; // Skip empty lines
    
    // Skip comment-only lines based on language
    if (language === 'JavaScript' || language === 'TypeScript') {
      // Skip lines that are only comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '*/' || trimmed.startsWith('*')) {
        continue;
      }
      meaningfulLines++;
    } else {
      // For other languages, count all non-empty lines
      meaningfulLines++;
    }
  }
  
  return Math.max(meaningfulLines, 1); // Ensure at least 1 line for non-empty files
}

function scanDirectory(dirPath: string): Map<string, { fileCount: number; totalLines: number }> {
  const languageStats = new Map<string, { fileCount: number; totalLines: number }>();

  function scanRecursively(currentPath: string) {
    try {
      const fs = require('fs');
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (item.isDirectory()) {
          if (!ignoredDirectories.has(item.name)) {
            scanRecursively(fullPath);
          }
        } else if (item.isFile()) {
          if (ignoredFiles.has(item.name)) {
            continue;
          }
          
          const ext = path.extname(item.name).toLowerCase();
          const language = extensionToLanguage[ext];
          
          if (language) {
            const lineCount = countLinesInFile(fullPath);
            const current = languageStats.get(language) || { fileCount: 0, totalLines: 0 };
            languageStats.set(language, {
              fileCount: current.fileCount + 1,
              totalLines: current.totalLines + lineCount
            });
          }
        }
      }
    } catch (error) {
      // Silently ignore directories we can't read
    }
  }

  scanRecursively(dirPath);
  return languageStats;
}

export function calculateLanguageStats(projectPath: string = process.cwd()): LanguageStats[] {
  const languageData = scanDirectory(projectPath);
  
  if (languageData.size === 0) {
    return [];
  }

  // Calculate total lines across all languages
  const totalLines = Array.from(languageData.values()).reduce(
    (sum, data) => sum + data.totalLines,
    0
  );

  // Convert to LanguageStats array with percentages
  const stats: LanguageStats[] = Array.from(languageData.entries())
    .map(([language, data]) => ({
      name: language,
      percentage: totalLines > 0 ? Math.round((data.totalLines / totalLines) * 100 * 10) / 10 : 0,
      color: getLanguageColor(language) || '#666666',
      fileCount: data.fileCount,
      totalLines: data.totalLines
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

  // Ensure percentages add up to 100% (handle rounding discrepancies)
  const totalPercentage = stats.reduce((sum, stat) => sum + stat.percentage, 0);
  if (totalPercentage !== 100 && stats.length > 0) {
    const diff = 100 - totalPercentage;
    stats[0].percentage += diff;
  }

  return stats;
}

// New function to analyze repository files from database
export interface RepositoryFile {
  path: string;
  content: string;
  action: string;
}

export function analyzeRepositoryFiles(files: RepositoryFile[]): LanguageStats[] {
  const languageStats = new Map<string, { fileCount: number; totalLines: number }>();
  
  // Filter out deleted files, ignored files, and markdown files
  const validFiles = files.filter(file => 
    file.action !== 'deleted' && 
    !ignoredFiles.has(path.basename(file.path)) &&
    !path.extname(file.path).toLowerCase().match(/\.(md|markdown)$/)
  );
  
  console.log('Analyzing files:', validFiles.map(f => ({ 
    path: f.path, 
    lines: countLinesInContent(f.content),
    contentLength: f.content.length,
    contentPreview: f.content.substring(0, 200) + (f.content.length > 200 ? '...' : '')
  })));
  
  for (const file of validFiles) {
    // Skip if file is in an ignored directory
    const pathParts = file.path.split('/');
    if (pathParts.some(part => ignoredDirectories.has(part))) {
      continue;
    }
    
    const ext = path.extname(file.path).toLowerCase();
    const language = extensionToLanguage[ext];
    
    if (language) {
      const lineCount = countLinesInContent(file.content);
      const meaningfulCount = countMeaningfulLines(file.content, language);
      
      // Use meaningful count directly since we've excluded documentation files
      let effectiveLines = meaningfulCount;
      
      const current = languageStats.get(language) || { fileCount: 0, totalLines: 0 };
      languageStats.set(language, {
        fileCount: current.fileCount + 1,
        totalLines: current.totalLines + effectiveLines
      });
      
      console.log(`File: ${file.path}, Language: ${language}, Original lines: ${lineCount}, Meaningful: ${meaningfulCount}, Effective: ${effectiveLines}`);
    }
  }
  
  if (languageStats.size === 0) {
    return [];
  }

  // Calculate total lines across all languages
  const totalLines = Array.from(languageStats.values()).reduce(
    (sum, data) => sum + data.totalLines,
    0
  );

  // Convert to LanguageStats array with percentages
  const stats: LanguageStats[] = Array.from(languageStats.entries())
    .map(([language, data]) => ({
      name: language,
      percentage: totalLines > 0 ? Math.round((data.totalLines / totalLines) * 100 * 10) / 10 : 0,
      color: getLanguageColor(language) || '#666666',
      fileCount: data.fileCount,
      totalLines: data.totalLines
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

  // Ensure percentages add up to 100% (handle rounding discrepancies)
  const totalPercentage = stats.reduce((sum, stat) => sum + stat.percentage, 0);
  if (totalPercentage !== 100 && stats.length > 0) {
    const diff = 100 - totalPercentage;
    stats[0].percentage += diff;
  }

  return stats;
}

