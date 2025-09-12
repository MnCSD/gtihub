import { Card } from "@/components/ui";

// Mock data - in real app this would come from props/API
const latestChanges = [
  "Improved file navigation and editing in the web UI",
  "Manage Copilot and users via Enterprise Teams in public preview",
  "Remote GitHub MCP Server is now generally available",
];

const LatestChanges = () => {
  return (
    <Card className="border-white/10 p-3">
      <h3 className="text-sm font-semibold text-white/90">Latest changes</h3>
      <div className="relative pl-4">
        <div
          className="absolute left-[9px] top-2 bottom-1 w-px bg-white/20"
          aria-hidden
        />
        <ul className="mt-2 space-y-3 text-sm text-white/70">
          {latestChanges.map((change, i) => (
            <li key={i} className="relative pl-2">
              <span
                className="absolute -left-3 top-1.5 size-2.5 rounded-full bg-white/60 border border-[#010409]"
                aria-hidden
              />
              <span className="block leading-5">{change}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default LatestChanges;
