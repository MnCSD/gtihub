import { Card, Button } from '@/components/ui';
import RepoCard from '@/components/repo-card';

// Mock data - in real app this would come from props/API
const trendingRepos = [
  {
    name: 'agentscope-ai/agentscope',
    description: 'AgentScope: Agent-Oriented Programming for Building LLM Applications',
    language: 'Python',
    stars: '8.9k',
  },
  {
    name: 'LuckyOne7777/ChatGPT-Micro-Cap-Experiment',
    description: 'This repo powers my blog experiment where ChatGPT manages a real-money micro-cap stock portfolio.',
    language: 'Python', 
    stars: '5.1k',
  },
];

const TrendingRepos = () => {
  return (
    <Card variant="dark" padding="none">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm text-white/60">
          <div className="inline-flex items-center gap-2">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              fill="currentColor"
            >
              <path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
            </svg>
            <span>Trending repositories</span>
          </div>
        </div>
        <button className="text-xs text-white/60 hover:text-white">
          See more
        </button>
      </div>
      
      <ul className="p-3 pt-0 px-0 space-y-3">
        {trendingRepos.map((repo, index) => (
          <li
            key={repo.name}
            className={`rounded ${
              index === trendingRepos.length - 1 ? '' : 'border-b border-white/10'
            } p-3`}
          >
            <div className="mt-2">
              <RepoCard
                name={repo.name}
                description={repo.description}
                language={repo.language}
                stars={repo.stars}
                compact
                rightAction={
                  <Button size="sm" variant="ghost">
                    ☆ Star
                  </Button>
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TrendingRepos;