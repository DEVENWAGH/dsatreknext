'use client';

import { useProblems } from '@/hooks/useProblems';
import React, { useEffect, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { useSession } from 'next-auth/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import dynamic from 'next/dynamic';

// Lazy load components with better loading states
const ProblemTable = dynamic(() => import('@/components/ProblemTable'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

const VirtualizedProblemTable = dynamic(
  () => import('@/components/VirtualizedProblemTable'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

const DifficultyFilter = dynamic(
  () => import('@/components/DifficultyFilter'),
  {
    loading: () => <Skeleton className="h-12 w-32" />,
    ssr: false,
  }
);

const DailyChallengeCalendar = dynamic(
  () => import('@/components/DailyChallengeCalendar'),
  {
    loading: () => <Skeleton className="h-12 w-48" />,
    ssr: false,
  }
);

const OptimizedProblemSet = () => {
  const { data, isLoading, error } = useProblems(1, 10);
  const problems = data?.problems || [];
  const pagination = data?.pagination || {};
  const {
    searchQuery,
    selectedDifficulty,
    setSearchQuery,
    setSelectedDifficulty,
  } = useUIStore();
  const { loadSolvedProblems } = useUserStore();
  const { data: session } = useSession();
  const [useVirtualization, setUseVirtualization] = React.useState(false);

  // Memoize search placeholders
  const searchPlaceholders = useMemo(
    () => [
      'Search for Two Sum...',
      'Find Binary Tree problems...',
      'Look for Dynamic Programming...',
      'Search Array problems...',
      'Find Graph algorithms...',
      'Search Google problems...',
      'Look for Amazon questions...',
      'Find hash-table problems...',
    ],
    []
  );

  // Memoize filtered problems count for performance
  const filteredProblemsCount = useMemo(() => {
    const problemsList = data?.problems || [];
    if (!problemsList?.length) return 0;
    return problemsList.filter(problem => {
      const matchesSearch =
        !searchQuery ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.tags || []).some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesSearch && matchesDifficulty;
    }).length;
  }, [data?.problems, searchQuery, selectedDifficulty]);

  // Auto-enable virtualization for large datasets
  React.useEffect(() => {
    setUseVirtualization(filteredProblemsCount > 50);
  }, [filteredProblemsCount]);

  // Data is automatically loaded by TanStack Query

  useEffect(() => {
    if (session?.user?.id) {
      loadSolvedProblems(session.user.id);
    }
  }, [loadSolvedProblems, session?.user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-4 w-80 animate-pulse" />
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Skeleton className="h-12 w-full animate-pulse" />
          </div>
          <Skeleton className="h-12 w-32 animate-pulse" />
        </div>

        {/* Results Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 animate-pulse" />
            <Skeleton className="h-4 w-40 animate-pulse" />
          </div>

          {/* Problem Table Skeleton */}
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-8 animate-pulse" />
                <Skeleton className="h-4 w-64 animate-pulse" />
                <Skeleton className="h-4 w-20 animate-pulse" />
                <Skeleton className="h-4 w-24 animate-pulse" />
                <Skeleton className="h-4 w-16 animate-pulse" />
              </div>
            </div>

            {/* Table Rows */}
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`problem-row-${i}`}
                className="border-b p-4 hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-8 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-5 w-72 animate-pulse" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16 animate-pulse" />
                      <Skeleton className="h-4 w-20 animate-pulse" />
                      <Skeleton className="h-4 w-24 animate-pulse" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                  <Skeleton className="h-4 w-12 animate-pulse" />
                  <Skeleton className="h-4 w-8 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load problems
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the problems. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Problem Set</h1>
          <p className="text-sm text-muted-foreground">
            Practice coding problems from top tech companies
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <PlaceholdersAndVanishInput
            placeholders={searchPlaceholders}
            onChange={setSearchQuery}
            value={searchQuery}
          />
        </div>
        <div className="flex gap-2">
          <Suspense fallback={<Skeleton className="h-12 w-32" />}>
            <DifficultyFilter
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
            />
          </Suspense>
          <div className="w-48">
            <Suspense fallback={<Skeleton className="h-12 w-48" />}>
              <DailyChallengeCalendar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileQuestion className="w-4 h-4" />
          <span>
            Total {pagination.total || 0} problems available
            {useVirtualization && ' (Virtualized)'}
          </span>
        </div>

        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            }
          >
            {useVirtualization ? <VirtualizedProblemTable /> : <ProblemTable />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default OptimizedProblemSet;
