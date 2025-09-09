'use client';

import { RepositoryList } from '@/components/ui';
import { useUserRepositories } from '@/hooks/useUserRepositories';

export default function Sidebar({
  owner,
  ownerImage,
}: {
  owner: string;
  ownerImage?: string | null;
}) {
  const { repositories, loading, error, refetch } = useUserRepositories();

  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] bg-[#0d1117] border-r border-white/10 p-3 space-y-4">
      <RepositoryList
        repositories={repositories}
        owner={owner}
        ownerImage={ownerImage}
        loading={loading}
        error={error}
        onRefresh={refetch}
        maxItems={7}
        showSearch={true}
        showNewButton={true}
      />

      <div className="rounded-lg bg-transparent p-3">
        <h3 className="text-sm font-semibold text-white/90 mb-2">
          Recent activity
        </h3>
        <div className="text-xs text-white/70">No recent activity yet</div>
      </div>
    </aside>
  );
}
