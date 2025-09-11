import UserAvatar from "@/components/ui/user-avatar";
import { LucideClockFading } from "lucide-react";
import Link from "next/link";
import { CommitInfo, User } from "./types";

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

interface CommitInfoBarProps {
  user: User;
  commit: CommitInfo | null;
  username: string;
  commitsCount: number;
}

export default function CommitInfoBar({ 
  user, 
  commit, 
  username, 
  commitsCount
}: CommitInfoBarProps) {
  if (!commit) {
    return (
      <div className="flex items-center gap-3 p-3.5 bg-[#151B23] border border-white/20 rounded-t-md">
        <UserAvatar user={user} size={20} />
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center">
            <div className="text-white">
              <span className="font-medium text-sm">
                {username}
              </span>
            </div>
            <span className="text-white/60 text-sm">
              No commits yet
            </span>
          </div>
        </div>
        <div className="text-xs text-white/60">
          <span>No commits</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>
            <LucideClockFading size={20} color={"gray"} />
          </span>
          <span>0 Commits</span>
        </div>
      </div>
    );
  }

  const shortHash = commit.sha.substring(0, 7);
  const timeAgo = formatRelative(commit.timestamp);

  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#151B23] border border-white/20 rounded-t-md">
      <UserAvatar user={user} size={20} />
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 items-center">
          <div className="text-white">
            <span className="font-medium text-sm">
              {commit.authorName}
            </span>
          </div>
          <Link
            href="#"
            className="text-white/60 hover:underline text-sm truncate"
            title={commit.message}
          >
            {commit.message}
          </Link>
        </div>
      </div>
      <div className="text-xs text-white/60">
        <span>{shortHash} • {timeAgo}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span>
          <LucideClockFading size={20} color={"gray"} />
        </span>
        <span>{commitsCount} Commit{commitsCount === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}