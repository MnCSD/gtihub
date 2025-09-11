import UserAvatar from "@/components/ui/user-avatar";
import { StarIcon } from "lucide-react";
import { RepositoryInfo, User } from "./types";

interface RepositoryHeaderProps {
  repository: RepositoryInfo;
  user: User;
}

export default function RepositoryHeader({ repository, user }: RepositoryHeaderProps) {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-4 border-b border-white/20 mb-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Repo info */}
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={user} size={28} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <span className="font-semibold">{repository.repo}</span>
              <span className="ml-3 text-xs border border-white/30 rounded-full px-2 py-1 text-white/80 font-normal">
                {repository.isPrivate ? "Private" : "Public"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="gray"
              >
                <path d="m11.294.984 3.722 3.722a1.75 1.75 0 0 1-.504 2.826l-1.327.613a3.089 3.089 0 0 0-1.707 2.084l-.584 2.454c-.317 1.332-1.972 1.8-2.94.832L5.75 11.311 1.78 15.28a.749.749 0 1 1-1.06-1.06l3.969-3.97-2.204-2.204c-.968-.968-.5-2.623.832-2.94l2.454-.584a3.08 3.08 0 0 0 2.084-1.707l.613-1.327a1.75 1.75 0 0 1 2.826-.504ZM6.283 9.723l2.732 2.731a.25.25 0 0 0 .42-.119l.584-2.454a4.586 4.586 0 0 1 2.537-3.098l1.328-.613a.25.25 0 0 0 .072-.404l-3.722-3.722a.25.25 0 0 0-.404.072l-.613 1.328a4.584 4.584 0 0 1-3.098 2.537l-2.454.584a.25.25 0 0 0-.119.42l2.731 2.732Z"></path>
              </svg>
            </span>
            <span>Pin</span>
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
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
                <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path>
              </svg>
            </span>
            <span>Watch</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
              0
            </span>
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="gray"
              >
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
              </svg>
            </span>
            <span>Fork</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
              0
            </span>
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-white/20 rounded-md bg-[#21262d] hover:bg-white/10">
            <span>
              <StarIcon size={16} color="gray" />
            </span>
            <span>Star</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full min-w-[16px] text-center ml-1">
              0
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}