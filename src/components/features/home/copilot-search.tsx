import { Button } from '@/components/ui';

const searchSuggestions = [
  'Create a profile README for me',
  'Create an issue for a bug',
  'Get code feedback',
];

const CopilotSearch = () => {
  return (
    <>
      <div className="rounded-lg border border-white/10 bg-[#0d1117] p-3 py-1 flex items-center gap-2">
        <input
          className="flex-1 bg-transparent placeholder:text-white/50 focus:outline-none text-sm"
          placeholder="Ask Copilot"
        />
        <button className="rounded px-3 py-1.5 text-sm">▶</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searchSuggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="ghost"
            size="sm"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </>
  );
};

export default CopilotSearch;