import Image from "next/image";

export default function Sidebar({
  owner,
  ownerImage,
}: {
  owner: string;
  ownerImage?: string | null;
}) {
  const initial = owner.charAt(0).toUpperCase();
  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] bg-[#0d1117] border-r border-white/10 p-3 space-y-4">
      <div className="rounded-lg  bg-transparent p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white/90">
            Top repositories
          </h3>
          <span className="text-xs text-white rounded-md bg-[#29903B] px-2 py-1.5 flex items-center gap-x-1 ">
            <span>
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                fill="#fff"
              >
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
              </svg>
            </span>
            <span> New</span>
          </span>
        </div>
        <input
          className="w-full h-8 rounded-md bg-[#0d1117] border border-white/15 px-2 text-sm placeholder:text-white/50 focus:outline-none"
          placeholder="Find a repository..."
        />
        <ul className="mt-2 space-y-1">
          {[
            "kodee",
            "hookhub",
            "gumroad",
            "kafka",
            "youtube",
            "ai-interview",
            "thesis",
          ].map((r) => (
            <li
              key={r}
              className="flex items-center justify-between py-1 rounded "
            >
              <div className="flex items-center gap-2 min-w-0">
                {ownerImage ? (
                  <Image
                    src={ownerImage}
                    alt={`${owner} avatar`}
                    width={20}
                    height={20}
                    className="rounded-full border border-white/20 flex-shrink-0"
                  />
                ) : (
                  <div className="size-[20px] rounded-full bg-white/10 text-[10px] text-white flex items-center justify-center border border-white/20 flex-shrink-0">
                    {initial}
                  </div>
                )}
                <span className="truncate text-sm text-white">
                  {owner}/{r}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-transparent p-3">
        <h3 className="text-sm font-semibold text-white/90 mb-2">
          Recent activity
        </h3>
        <div className="text-xs text-white/70">No recent activity yet</div>
      </div>
    </aside>
  );
}
