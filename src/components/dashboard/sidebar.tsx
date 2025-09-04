export default function Sidebar({ owner }: { owner: string }) {
  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] bg-[#0d1117] border-r border-white/10 p-3 space-y-4">
      <div className="rounded-lg  bg-transparent p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white/90">
            Top repositories
          </h3>
          <span className="text-xs text-white/60 rounded bg-white/10 px-1.5 py-0.5">
            New
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
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-white/5"
            >
              <span className="truncate text-sm text-white">
                {owner}/{r}
              </span>
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
