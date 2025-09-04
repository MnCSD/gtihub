import Image from "next/image";

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

export default function Navbar({ user }: { user: NavUser }) {
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#010409] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/github-mark-white.png" alt="Logo" width={26} height={26} />
          <span className="font-semibold">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-[#010409] border border-white/15 rounded-md px-2 py-1.5 w-[320px]">
            <svg className="size-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input className="ml-2 flex-1 bg-transparent text-sm placeholder:text-white/50 focus:outline-none" placeholder="Type / to search" />
          </div>
          {user?.image ? (
            <Image src={user.image} alt={user.name || user.email || "User"} width={28} height={28} className="rounded-full border border-white/20" />
          ) : (
            <div className="size-8 rounded-full bg-white/10 text-white flex items-center justify-center font-semibold">
              {initial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
