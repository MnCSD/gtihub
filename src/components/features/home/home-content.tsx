import CopilotSearch from './copilot-search';
import TrendingRepos from './trending-repos';
import RecommendedRepos from './recommended-repos';
import LatestChanges from './latest-changes';
import ExploreRepos from './explore-repos';

const HomeContent = () => {
  return (
    <div className="mx-auto lg:max-w-[1230px] max-w-[300px] grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Center feed */}
      <section className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Home</h1>
        
        <CopilotSearch />
        <TrendingRepos />
        <RecommendedRepos />
      </section>

      {/* Right sidebar */}
      <aside className="lg:col-span-1 space-y-4">
        <LatestChanges />
        <ExploreRepos />
      </aside>
    </div>
  );
};

export default HomeContent;