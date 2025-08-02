'use client';

import React, { memo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { CompanyBadgeWithDialog } from '@/components/ui/company-logos-dialog';
import { Check, Lock } from 'lucide-react';

/**
 * Optimized Problem Row component with React.memo and performance optimizations
 */
const OptimizedProblemRow = memo(
  ({ problem, index, isLast, isSolved, onProblemClick }) => {
    // Memoize click handler to prevent unnecessary re-renders
    const handleClick = useCallback(() => {
      onProblemClick(problem.id);
    }, [problem.id, onProblemClick]);

    // Memoize difficulty color calculation
    const difficultyColor = React.useMemo(() => {
      switch (problem.difficulty?.toLowerCase()) {
        case 'easy':
          return 'bg-green-500/10 text-green-500';
        case 'medium':
          return 'bg-yellow-500/10 text-yellow-500';
        case 'hard':
          return 'bg-red-500/10 text-red-500';
        default:
          return 'bg-gray-500/10 text-gray-500';
      }
    }, [problem.difficulty]);

    // Memoize acceptance rate calculation
    const acceptanceData = React.useMemo(() => {
      const total = parseInt(problem.totalSubmissions) || 0;
      const accepted = parseInt(problem.acceptedSubmissions) || 0;
      const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';
      return { rate, accepted, total };
    }, [problem.totalSubmissions, problem.acceptedSubmissions]);

    // Memoize companies array
    const companies = React.useMemo(
      () => problem.companies || [],
      [problem.companies]
    );

    // Memoize visible tags
    const visibleTags = React.useMemo(() => {
      const tags = problem.tags || [];
      return {
        visible: tags.slice(0, 3),
        remaining: Math.max(0, tags.length - 3),
      };
    }, [problem.tags]);

    return (
      <tr className="border-b hover:bg-muted/50">
        <td className="p-4 font-medium cursor-pointer" onClick={handleClick}>
          <div className="flex items-center gap-2">
            {isSolved && <Check className="h-4 w-4 text-green-500" />}
            {problem.is_premium && <Lock className="h-4 w-4 text-yellow-500" />}
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
          <Badge className={difficultyColor}>{problem.difficulty}</Badge>
        </td>

        <td className="p-4">
          <div className="text-sm">
            <div className="font-medium">{acceptanceData.rate}%</div>
            <div className="text-muted-foreground text-xs">
              {acceptanceData.accepted}/{acceptanceData.total}
            </div>
          </div>
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
            {visibleTags.visible.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {visibleTags.remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{visibleTags.remaining} more
              </Badge>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

OptimizedProblemRow.displayName = 'OptimizedProblemRow';

export default OptimizedProblemRow;
