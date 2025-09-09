'use client';

import { useState, useEffect } from 'react';
import { UserRepository } from '@/types';

interface UseUserRepositoriesReturn {
  repositories: UserRepository[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserRepositories = (): UseUserRepositoriesReturn => {
  const [repositories, setRepositories] = useState<UserRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/repositories', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please sign in');
        }
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the response data
      const transformedRepos = data.repositories.map((repo: any) => ({
        ...repo,
        createdAt: new Date(repo.createdAt),
        updatedAt: new Date(repo.updatedAt),
        lastCommit: repo.lastCommit ? {
          ...repo.lastCommit,
          timestamp: new Date(repo.lastCommit.timestamp),
        } : null,
      }));

      setRepositories(transformedRepos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(errorMessage);
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  return {
    repositories,
    loading,
    error,
    refetch: fetchRepositories,
  };
};