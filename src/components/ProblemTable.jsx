'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProblems } from '@/hooks/useProblems';
import {
  useUIStore,
  useCompanyStore,
  useUserStore,
} from '@/store';


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

  // TanStack Query for problems data
  const { data: problems = [], isLoading } = useProblems();

  const {
    searchQuery,
    selectedDifficulty,
    // selectedTags,
    // currentPage,
    // setSearchQuery,
    // setSelectedDifficulty,
    // setCurrentPage,
  } = useUIStore();

  const { getCompanyFromCache } = useCompanyStore();
  const getAllCompanies = useCompanyStore(state => state.getAllCompanies);

  const { solvedProblems } = useUserStore();
  const [sortBy, setSortBy] = React.useState('number');
  const [sortOrder, setSortOrder] = React.useState('asc');

  // Problems are automatically loaded by TanStack Query

  // Memoized handlers
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'acceptance' ? 'desc' : 'asc');
    }
  }, [sortBy, sortOrder]);

  const handleProblemClick = useCallback((problemId) => {
    // Navigate immediately - TanStack Query will handle data fetching
    router.push(`/workspace/${problemId}`);
  }, [router]);

  // Memoized difficulty color function
  const getDifficultyColorMemo = useCallback((difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  }, []);

  // Filter and sort problems with better performance
  const filteredProblems = useMemo(() => {
    if (!problems || problems.length === 0) return [];

    const filtered = problems.filter(problem => {
      // Search in title, tags, and company names
      const matchesSearch =
        !searchQuery ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.tags || []).some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (problem.companies || []).some(companyId => {
          const company = getCompanyFromCache(companyId);
          return company?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

      // Filter by difficulty
      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });

    // Sort problems
    return filtered.sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'number') {
        aValue = parseInt(a.title.match(/\d+/)?.[0] || '0');
        bValue = parseInt(b.title.match(/\d+/)?.[0] || '0');
      } else if (sortBy === 'acceptance') {
        const aTotal = parseInt(a.totalSubmissions) || 0;
        const aAccepted = parseInt(a.acceptedSubmissions) || 0;
        const bTotal = parseInt(b.totalSubmissions) || 0;
        const bAccepted = parseInt(b.acceptedSubmissions) || 0;
        aValue = aTotal > 0 ? (aAccepted / aTotal) * 100 : 0;
        bValue = bTotal > 0 ? (bAccepted / bTotal) * 100 : 0;
      } else if (sortBy === 'difficulty') {
        // Easy < Medium < Hard
        const diffRank = d => {
          if (!d) return 0;
          const val = d.toLowerCase();
          if (val === 'easy') return 1;
          if (val === 'medium') return 2;
          if (val === 'hard') return 3;
          return 0;
        };
        aValue = diffRank(a.difficulty);
        bValue = diffRank(b.difficulty);
      }
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [
    problems,
    searchQuery,
    selectedDifficulty,
    getCompanyFromCache,
    sortBy,
    sortOrder,
  ]);

  // Fetch all companies once on mount
  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);



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



  const displayProblems = filteredProblems;

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
              
              // Debug: Log problem data to check is_premium field
              if (index < 3) {
                console.log(`Problem ${index}:`, { id: problem.id, title: problem.title, is_premium: problem.is_premium });
              }

              return (
                <tr 
                  key={problem.id} 
                  className="border-b hover:bg-muted/50"
                >
                  <td
                    className="p-4 font-medium cursor-pointer"
                    onClick={() => handleProblemClick(problem.id)}
                  >
                    <div className="flex items-center gap-2">
                      {solvedProblems?.includes(problem.id) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {problem.is_premium && (
                        <Lock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="flex items-center gap-2">
                        {problem.title}
                        {index < 3 && (
                          <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                            Demo
                          </Badge>
                        )}
                        {problem.is_premium && (
                          <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">
                            Premium
                          </Badge>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getDifficultyColorMemo(problem.difficulty)}>
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
      

    </div>
  );
};

export default ProblemTable;
