import { ChevronDownIcon, CodeIcon, TagIcon } from "lucide-react";
import CommitInfoBar from "./commit-info-bar";
import FileList from "./file-list";
import { CommitInfo, FileItem, User } from "./types";

interface FileBrowserProps {
  user: User;
  username: string;
  commit: CommitInfo | null;
  files: FileItem[];
  branchesCount: number;
  commitsCount: number;
  currentBranch?: string;
}

export default function FileBrowser({ 
  user, 
  username, 
  commit, 
  files, 
  branchesCount,
  commitsCount,
  currentBranch = "main"
}: FileBrowserProps) {
  return (
    <div>
      {/* File browser header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
            <span>
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="gray"
                display="inline-block"
                overflow="visible"
              >
                <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
              </svg>
            </span>
            <span>{currentBranch}</span>
            <span className="text-xs">
              <ChevronDownIcon size={14} />
            </span>
          </button>
          
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="gray"
                display="inline-block"
                overflow="visible"
              >
                <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
              </svg>
              <span>
                <span className="text-white">{branchesCount} </span>
                Branches
              </span>
            </div>

            <div className="flex items-center gap-1">
              <TagIcon size={14} />
              <span>
                <span className="text-white">0 </span>
                Tags
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            placeholder="Go to file"
            className="h-8 w-64 rounded-md bg-transparent border border-white/30 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:border-[#58a6ff]"
          />
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-md bg-white/10">
            <span>Add file</span>
            <span className="text-xs">
              <ChevronDownIcon size={14} />
            </span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#238636] hover:bg-[#2ea043] rounded-md">
            <span>
              <CodeIcon size={16} color="white" />
            </span>
            <span>Code</span>
            <span className="text-xs">
              <ChevronDownIcon size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Commit info bar and file list */}
      <div className="border border-white/20 rounded-md overflow-hidden">
        <CommitInfoBar 
          user={user} 
          commit={commit} 
          username={username}
          commitsCount={commitsCount}
        />
        <FileList files={files} />
      </div>
    </div>
  );
}