import { Logo, SearchInput, UserAvatar } from "@/components/ui";
import { MenuIcon } from "@/components/icons";
import UserMenu from "@/components/dashboard/user-menu";
import { NavUser } from "@/types";

export interface NavbarProps {
  user: NavUser;
  repositoryInfo?: {
    username: string;
    repo: string;
    displayText: string;
  };
}

export default function Navbar({ user, repositoryInfo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#010409] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="border border-white/20 rounded-md p-2 cursor-pointer hover:bg-white/10">
            <MenuIcon className="text-white" />
          </div>
          <Logo size={26} />
          <div className="flex items-center gap-2">
            {repositoryInfo ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="mr-3">{repositoryInfo.username}</span>
                  <span className="text-white/40 text-[18px]">/</span>
                  <span className="font-semibold ml-3">
                    {repositoryInfo.repo}
                  </span>
                </span>
              </div>
            ) : (
              <span className="">Dashboard</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput placeholder="Type / to search" width="w-[320px]" />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
