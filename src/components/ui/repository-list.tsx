'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { UserRepository } from '@/types';
import UserAvatar from './user-avatar';

export interface RepositoryListProps {
  repositories: UserRepository[];
  owner: string;
  ownerImage?: string | null;
  showSearch?: boolean;
  showNewButton?: boolean;
  loading?: boolean;
  error?: string | null;
  maxItems?: number;
  onRefresh?: () => void;
}

const RepositoryListSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <li key={i} className="flex items-center gap-2 py-1 rounded animate-pulse">
        <div className="size-[20px] rounded-full bg-white/10 flex-shrink-0" />
        <div className="h-4 bg-white/10 rounded flex-1" />
      </li>
    ))}
  </>
);

const EmptyState = () => (
  <div className="text-center py-4">
    <div className="text-white/50 text-sm mb-2">No repositories yet</div>
    <Link 
      href="/new" 
      className="text-xs text-[#58a6ff] hover:underline"
    >
      Create your first repository
    </Link>
  </div>
);

const SearchEmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <div className="text-center py-4">
    <div className="text-white/50 text-sm mb-2">
      No repositories found matching "{searchQuery}"
    </div>
    <div className="text-white/40 text-xs">
      Try different keywords or create a new repository
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="text-center py-4">
    <div className="text-red-400 text-sm mb-2">{error}</div>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="text-xs text-[#58a6ff] hover:underline"
      >
        Try again
      </button>
    )}
  </div>
);

const RepositoryItem = ({ 
  repository, 
  owner, 
  ownerImage,
  searchQuery = '' 
}: { 
  repository: UserRepository; 
  owner: string; 
  ownerImage?: string | null;
  searchQuery?: string;
}) => {
  const user = {
    name: owner,
    image: ownerImage,
  };

  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-400/30 text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <li className="group">
      <Link 
        href={`/${owner}/${repository.name}`}
        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 transition-colors"
      >
        <UserAvatar user={user} size={20} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm text-white font-medium">
              {highlightText(`${owner}/${repository.name}`, searchQuery)}
            </span>
            {repository.isPrivate && (
              <span className="text-xs text-white/60 bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                Private
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

const RepositoryList = ({
  repositories,
  owner,
  ownerImage,
  showSearch = true,
  showNewButton = true,
  loading = false,
  error = null,
  maxItems,
  onRefresh,
}: RepositoryListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter repositories based on search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) {
      return repositories;
    }

    const query = searchQuery.toLowerCase().trim();
    return repositories.filter((repo) => {
      const fullName = `${owner}/${repo.name}`.toLowerCase();
      const description = repo.description?.toLowerCase() || '';
      
      return (
        fullName.includes(query) ||
        repo.name.toLowerCase().includes(query) ||
        description.includes(query)
      );
    });
  }, [repositories, searchQuery, owner]);

  // Apply maxItems limit after filtering
  const displayedRepos = maxItems ? filteredRepos.slice(0, maxItems) : filteredRepos;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="rounded-lg bg-transparent p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white/90">
          Top repositories
        </h3>
        {showNewButton && (
          <Link
            href="/new"
            className="text-xs text-white rounded-md bg-[#29903B] px-2 py-1.5 flex items-center gap-x-1 hover:bg-[#2ea043] transition-colors"
          >
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              fill="#fff"
            >
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            <span>New</span>
          </Link>
        )}
      </div>

      {showSearch && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 rounded-md bg-[#0d1117] border border-white/15 px-2 text-sm placeholder:text-white/50 focus:outline-none focus:border-[#58a6ff] transition-colors"
            placeholder="Find a repository..."
          />
          {hasSearchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              title="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 4.586L10.293.293a1 1 0 1 1 1.414 1.414L7.414 6l4.293 4.293a1 1 0 1 1-1.414 1.414L6 7.414l-4.293 4.293a1 1 0 1 1-1.414-1.414L4.586 6 .293 1.707A1 1 0 1 1 1.707.293L6 4.586Z"/>
              </svg>
            </button>
          )}
        </div>
      )}

      <ul className="mt-2 space-y-1 min-h-[100px]">
        {loading && <RepositoryListSkeleton count={maxItems || 5} />}
        
        {error && !loading && (
          <ErrorState error={error} onRetry={onRefresh} />
        )}
        
        {!loading && !error && displayedRepos.length === 0 && hasSearchQuery && (
          <SearchEmptyState searchQuery={searchQuery} />
        )}
        
        {!loading && !error && displayedRepos.length === 0 && !hasSearchQuery && (
          <EmptyState />
        )}
        
        {!loading && !error && displayedRepos.length > 0 && displayedRepos.map((repository) => (
          <RepositoryItem
            key={repository.id}
            repository={repository}
            owner={owner}
            ownerImage={ownerImage}
            searchQuery={searchQuery}
          />
        ))}
      </ul>

      {!loading && !error && filteredRepos.length > (maxItems || 0) && maxItems && (
        <div className="mt-3 text-center">
          <Link 
            href="/repositories" 
            className="text-xs text-[#58a6ff] hover:underline"
          >
            {hasSearchQuery ? (
              <>View all {filteredRepos.length} matching repositories</>
            ) : (
              <>View all {repositories.length} repositories</>
            )}
          </Link>
        </div>
      )}
      
      {hasSearchQuery && filteredRepos.length > 0 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-white/50">
            Showing {Math.min(filteredRepos.length, maxItems || filteredRepos.length)} of {filteredRepos.length} results
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryList;