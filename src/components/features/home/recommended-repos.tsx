import { Card, Button } from "@/components/ui";
import RepoCard from "@/components/repo-card";

// Mock data - in real app this would come from props/API
const recommendedRepos = [
  {
    name: "yangshun/front-end-interview-handbook",
    description:
      "Front End interview preparation materials for busy engineers (updated for 2025)",
    language: "MDX",
    stars: "43.5k",
  },
];

const RecommendedRepos = () => {
  return (
    <Card className="border-white/10">
      <div className="flex items-center justify-between px-3 py-3">
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
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z" />
            </svg>
            <span>Recommended for you</span>
          </div>
        </div>
      </div>

      <ul className="p-3 pt-0 px-0 space-y-3">
        {recommendedRepos.map((repo) => (
          <li key={repo.name} className="rounded p-3">
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
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecommendedRepos;
