import { Card, Button } from "@/components/ui";
import RepoCard from "@/components/repo-card";

// Mock data - in real app this would come from props/API
const exploreRepos = [
  {
    name: "jhlywa / chess.js",
    language: "TypeScript",
    description:
      "A JavaScript chess library for chess move generation, validation, and engine communication",
    stars: "4.1k",
  },
  {
    name: "official-stockfish / fishtest",
    language: "Python",
    description: "Distributed testing framework for the Stockfish chess engine",
    stars: "311",
  },
  {
    name: "excaliburjs / Excalibur",
    language: "TypeScript",
    description:
      "A JavaScript/TypeScript game engine for making 2D games with HTML5 and WebGL",
    stars: "2.1k",
  },
];

const ExploreRepos = () => {
  return (
    <Card className="border-white/10">
      <h3 className="text-sm font-semibold text-white/90 pl-3 pt-3">
        Explore repositories
      </h3>
      <ul className="mt-2 space-y-2">
        {exploreRepos.map((repo, index) => (
          <li
            key={repo.name}
            className={`rounded p-3 flex flex-col gap-y-3 ${
              index === exploreRepos.length - 1
                ? ""
                : "border-b border-white/10"
            }`}
          >
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

export default ExploreRepos;
