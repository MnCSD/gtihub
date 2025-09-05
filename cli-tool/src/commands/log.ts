import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  committer: string;
  timestamp: number;
  treeHash: string;
  parentSha?: string;
  isHead?: boolean;
  branches?: string[];
}

export const logCommand = new Command('log')
  .description('Show commit logs')
  .option('--oneline', 'show each commit on a single line')
  .option('-n, --max-count <number>', 'limit the number of commits to output')
  .option('--graph', 'show a text-based graphical representation')
  .action(async (options) => {
    const currentDir = process.cwd();
    const githDir = path.join(currentDir, '.gith');
    const headFile = path.join(githDir, 'HEAD');

    try {
      // Check if .gith repository exists
      if (!(await fs.pathExists(githDir))) {
        console.error(chalk.red('fatal: not a gith repository (or any of the parent directories): .gith'));
        process.exit(1);
      }

      // Get current branch
      const headContent = await fs.readFile(headFile, 'utf-8');
      const branchRef = headContent.trim().replace('ref: ', '');
      const branchName = branchRef.split('/').pop() || 'main';
      const branchFile = path.join(githDir, branchRef);

      if (!(await fs.pathExists(branchFile))) {
        console.log(chalk.yellow('No commits yet'));
        return;
      }

      const currentCommitSha = (await fs.readFile(branchFile, 'utf-8')).trim();

      // Collect all commits in chronological order (newest first)
      const commits: CommitInfo[] = [];
      const processedCommits = new Set<string>();
      
      const collectCommits = async (commitSha: string): Promise<void> => {
        if (processedCommits.has(commitSha)) return;
        processedCommits.add(commitSha);

        const commitDir = path.join(githDir, 'objects', commitSha.substring(0, 2));
        const commitFile = path.join(commitDir, commitSha.substring(2));

        if (!(await fs.pathExists(commitFile))) {
          return;
        }

        const commitContent = await fs.readFile(commitFile, 'utf-8');
        const lines = commitContent.split('\n');

        let treeHash = '';
        let parentSha: string | undefined;
        let author = '';
        let committer = '';
        let messageStart = 0;

        // Parse commit object
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('tree ')) {
            treeHash = line.substring(5);
          } else if (line.startsWith('parent ')) {
            parentSha = line.substring(7);
          } else if (line.startsWith('author ')) {
            author = line.substring(7);
          } else if (line.startsWith('committer ')) {
            committer = line.substring(10);
          } else if (line === '') {
            messageStart = i + 1;
            break;
          }
        }

        const message = lines.slice(messageStart).join('\n').trim();

        // Parse author/committer timestamp
        const parseAuthorInfo = (authorLine: string) => {
          const match = authorLine.match(/^(.+) (\d+) ([\+\-]\d{4})$/);
          return match ? {
            info: match[1],
            timestamp: parseInt(match[2])
          } : {
            info: authorLine,
            timestamp: Date.now() / 1000
          };
        };

        const authorInfo = parseAuthorInfo(author);
        const committerInfo = parseAuthorInfo(committer);

        commits.push({
          sha: commitSha,
          message,
          author: authorInfo.info,
          committer: committerInfo.info,
          timestamp: authorInfo.timestamp,
          treeHash,
          parentSha,
          isHead: commitSha === currentCommitSha
        });

        // Recursively process parent commit
        if (parentSha) {
          await collectCommits(parentSha);
        }
      };

      await collectCommits(currentCommitSha);

      // Apply filters
      let filteredCommits = commits;
      if (options.maxCount) {
        const maxCount = parseInt(options.maxCount);
        filteredCommits = commits.slice(0, maxCount);
      }

      if (filteredCommits.length === 0) {
        console.log(chalk.yellow('No commits found'));
        return;
      }

      // Display commits
      for (let i = 0; i < filteredCommits.length; i++) {
        const commit = filteredCommits[i];
        
        if (options.oneline) {
          // Oneline format: sha (7 chars) + refs + message
          const shortSha = chalk.yellow(commit.sha.substring(0, 7));
          let headMarker = '';
          if (commit.isHead) {
            const headText = chalk.cyan('HEAD');
            const arrow = chalk.white(' -> ');
            const branchText = chalk.green(branchName);
            headMarker = ` (${headText}${arrow}${branchText})`;
          }
          console.log(`${shortSha}${headMarker} ${commit.message}`);
        } else {
          // Full format like Git with proper colors
          const shortSha = commit.sha.substring(0, 7);
          
          // HEAD and branch indicators with proper Git colors
          let refInfo = '';
          if (commit.isHead) {
            const headText = chalk.cyan('HEAD');
            const arrow = chalk.white(' -> ');
            const branchText = chalk.green(branchName);
            // Add origin branch if available (would be red)
            const originText = chalk.red('origin/' + branchName);
            refInfo = ` (${headText}${arrow}${branchText}, ${originText})`;
          }
          
          // Check if this is a merge commit
          const isMerge = commit.parentSha && commits.some(c => c.sha !== commit.sha && c.parentSha === commit.parentSha);
          let mergeInfo = '';
          if (isMerge && commit.parentSha) {
            const parentShort = commit.parentSha.substring(0, 7);
            mergeInfo = chalk.white(`\nMerge: ${parentShort} ${shortSha}`);
          }

          // Format exactly like Git: orange "commit" + yellow SHA + colored refs
          const commitText = chalk.hex('#ff8c00')('commit'); // Orange like Git
          const shaText = chalk.yellow(commit.sha);
          console.log(`${commitText} ${shaText}${refInfo}${mergeInfo}`);
          console.log(chalk.white(`Author: ${commit.author}`));
          
          // Format date like Git (e.g., "Fri Sep 5 16:36:07 2025 +0300")
          const date = new Date(commit.timestamp * 1000);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const dayName = dayNames[date.getDay()];
          const monthName = monthNames[date.getMonth()];
          const day = date.getDate();
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          const year = date.getFullYear();
          
          // Simple timezone (you could make this more accurate)
          const timezoneOffset = -date.getTimezoneOffset();
          const tzHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
          const tzMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
          const tzSign = timezoneOffset >= 0 ? '+' : '-';
          const timezone = `${tzSign}${tzHours}${tzMinutes}`;
          
          const formattedDate = `${dayName} ${monthName} ${day} ${hours}:${minutes}:${seconds} ${year} ${timezone}`;
          console.log(chalk.white(`Date:   ${formattedDate}`));
          console.log('');
          
          // Indent commit message
          const messageLines = commit.message.split('\n');
          messageLines.forEach(line => {
            console.log(`    ${line}`);
          });
          
          // Add spacing between commits (except for the last one)
          if (i < filteredCommits.length - 1) {
            console.log('');
          }
        }
      }

    } catch (error) {
      console.error(chalk.red('Error displaying log:'), error);
      process.exit(1);
    }
  });