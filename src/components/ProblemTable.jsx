'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProblems, usePrefetchProblem } from '@/hooks/useProblems';
import { useUIStore, useCompanyStore, useUserStore } from '@/store';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyBadgeWithDialog } from '@/components/ui/company-logos-dialog';
import { Check, ArrowUpDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Optimized ProblemTable component using centralized state management
 * This replaces multiple useState hooks with centralized Zustand stores
 */
const ProblemTable = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  // TanStack Query for problems data with pagination
  const { data, isLoading } = useProblems(currentPage, ITEMS_PER_PAGE);
  const problems = data?.problems || [];
  const pagination = data?.pagination || {};

  // Prefetch hook for hover functionality
  const prefetchProblem = usePrefetchProblem();

  const { searchQuery, selectedDifficulty } = useUIStore();

  const { getCompanyFromCache } = useCompanyStore();
  const getAllCompanies = useCompanyStore(state => state.getAllCompanies);

  const { solvedProblems } = useUserStore();
  const [sortBy, setSortBy] = React.useState('number');
  const [sortOrder, setSortOrder] = React.useState('asc');

  // Problems are automatically loaded by TanStack Query

  // Memoized handlers
  const handleSort = useCallback(
    field => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder(field === 'acceptance' ? 'desc' : 'asc');
      }
    },
    [sortBy, sortOrder]
  );

  const handleProblemClick = useCallback(
    problemId => {
      // Navigate immediately - TanStack Query will handle data fetching
      router.push(`/workspace/${problemId}`);
    },
    [router]
  );

  const handleProblemHover = useCallback(
    problemId => {
      // Prefetch problem data on hover
      prefetchProblem(problemId);
    },
    [prefetchProblem]
  );

  // Memoized difficulty color function
  const getDifficultyColorMemo = useCallback(difficulty => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'hard':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  }, []);

  // Use problems directly from server (already paginated)
  const displayProblems = problems || [];

  // Fetch all companies once on mount
  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDifficulty, sortBy, sortOrder]);

  const SKELETON_ITEMS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {SKELETON_ITEMS.map(key => (
          <Skeleton key={key} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Server-side pagination info
  const totalPages = pagination.totalPages || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(
    currentPage * ITEMS_PER_PAGE,
    pagination.total || 0
  );

  return (
    <div className="space-y-6">
      {/* Problems Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('number')}
                  className="h-auto p-0 font-semibold"
                >
                  Title
                  {sortBy === 'number' && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('difficulty')}
                  className="h-auto p-0 font-semibold"
                >
                  Difficulty
                  {sortBy === 'difficulty' && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('acceptance')}
                  className="h-auto p-0 font-semibold"
                >
                  Acceptance
                  {sortBy === 'acceptance' && (
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </th>
              <th className="text-left p-4">Company</th>
              <th className="text-left p-4">Tags</th>
            </tr>
          </thead>
          <tbody>
            {displayProblems.map((problem, index) => {
              const companies = problem.companies || [];
              const isLast = index === displayProblems.length - 1;

              return (
                <tr key={problem.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">
                    <div
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleProblemClick(problem.id)}
                      onMouseEnter={() => handleProblemHover(problem.id)}
                    >
                      <div className="flex items-center gap-2">
                        {solvedProblems?.includes(problem.id) && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {problem.isPremium && (
                          <Lock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="flex items-center gap-2">
                          {problem.title}
                          {index < 3 && (
                            <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                              Demo
                            </Badge>
                          )}
                          {problem.isPremium && (
                            <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">
                              Premium
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={getDifficultyColorMemo(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const total = parseInt(problem.totalSubmissions) || 0;
                      const accepted =
                        parseInt(problem.acceptedSubmissions) || 0;
                      const rate =
                        total > 0
                          ? ((accepted / total) * 100).toFixed(1)
                          : '0.0';
                      return (
                        <div className="text-sm">
                          <div className="font-medium">{rate}%</div>
                          <div className="text-muted-foreground text-xs">
                            {accepted}/{total}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                    <CompanyBadgeWithDialog
                      companyIds={companies}
                      maxVisible={1}
                      variant="secondary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {problem.tags?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{problem.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {pagination.total || 0} problems
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-muted-foreground">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;
