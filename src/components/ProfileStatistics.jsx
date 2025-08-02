'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { authAPI } from '@/api/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ThemeSelector from './ThemeSelector';
import { useSession } from 'next-auth/react';

const ProfileStatistics = ({ userId }) => {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.id === userId;
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLanguageDisplayName = languageId => {
    const languageMap = {
      50: 'C',
      54: 'C++',
      62: 'Java',
      71: 'Python',
      63: 'JavaScript',
      68: 'PHP',
      72: 'Ruby',
      73: 'Rust',
      60: 'Go',
      // Add support for display names as well
      c: 'C',
      'c++': 'C++',
      cpp: 'C++',
      java: 'Java',
      python: 'Python',
      javascript: 'JavaScript',
      php: 'PHP',
      ruby: 'Ruby',
      rust: 'Rust',
      go: 'Go',
    };
    return (
      languageMap[languageId] ||
      languageId.charAt(0).toUpperCase() + languageId.slice(1)
    );
  };

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        const response = await authAPI.getUserStatistics(userId);
        console.log('Fetched user stats in ProfileStatistics:', response);

        if (response.success && response.data) {
          setUserStats(response.data);
        } else {
          console.error('Invalid response structure:', response);
          setUserStats({
            totalSolved: 0,
            totalSubmissions: 0,
            acceptanceRate: 0,
            solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
            solvedByLanguage: {},
          });
        }
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        setUserStats({
          totalSolved: 0,
          totalSubmissions: 0,
          acceptanceRate: 0,
          solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
          solvedByLanguage: {},
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  const problemsSolved = userStats?.totalSolved || 0;
  const totalSubmissions = userStats?.totalSubmissions || 0;
  const acceptanceRate = userStats?.acceptanceRate || 0;
  const solvedByDifficulty = userStats?.solvedByDifficulty || {
    easy: 0,
    medium: 0,
    hard: 0,
  };
  const solvedByLanguage = userStats?.solvedByLanguage || {};

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 via-background/95 to-amber-600/10 backdrop-blur-sm border-amber-500/20">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 px-6">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-500" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-6 px-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <Skeleton className="h-8 w-1/2 mx-auto mb-2 bg-amber-500/20" />
              <Skeleton className="h-4 w-3/4 mx-auto bg-amber-500/10" />
            </div>
            <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <Skeleton className="h-8 w-1/2 mx-auto mb-2 bg-amber-500/20" />
              <Skeleton className="h-4 w-3/4 mx-auto bg-amber-500/10" />
            </div>
          </div>

          <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <Skeleton className="h-4 w-1/3 mx-auto mb-2 bg-amber-500/20" />
            <Skeleton className="h-6 w-1/4 mx-auto bg-amber-500/10" />
          </div>

          <div className="text-center flex flex-col items-center space-y-2">
            <Skeleton className="h-4 w-1/3 mx-auto" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="flex justify-center gap-4 mt-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          <div className="text-center flex flex-col items-center space-y-2">
            <Skeleton className="h-4 w-1/3 mx-auto" />
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userStats) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 via-background/95 to-amber-600/10 backdrop-blur-sm border-amber-500/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart2 className="w-12 h-12 text-amber-500/50 mb-4" />
          <p className="text-amber-600/70">Could not load statistics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-background/95 to-amber-600/10 backdrop-blur-sm border-amber-500/20 shadow-lg shadow-amber-500/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
          <BarChart2 className="w-5 h-5 text-amber-500" />
          Statistics
        </CardTitle>
        {isOwnProfile && <ThemeSelector />}
      </CardHeader>
      <CardContent className="flex flex-col space-y-6 px-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {problemsSolved}
            </div>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </div>
          <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {totalSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">Total Submissions</p>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="text-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
          <p className="text-xs text-muted-foreground mb-2">Acceptance Rate</p>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {acceptanceRate}%
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="text-center flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground">Solved by Difficulty</p>
          <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{
                  width:
                    problemsSolved > 0
                      ? `${(solvedByDifficulty.easy / problemsSolved) * 100}%`
                      : '0%',
                }}
              />
              <div
                className="bg-yellow-500 h-full transition-all duration-300"
                style={{
                  width:
                    problemsSolved > 0
                      ? `${(solvedByDifficulty.medium / problemsSolved) * 100}%`
                      : '0%',
                }}
              />
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{
                  width:
                    problemsSolved > 0
                      ? `${(solvedByDifficulty.hard / problemsSolved) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">
                Easy: {solvedByDifficulty.easy}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">
                Medium: {solvedByDifficulty.medium}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">
                Hard: {solvedByDifficulty.hard}
              </span>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="text-center flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground">Solved by Language</p>
          {solvedByLanguage &&
          typeof solvedByLanguage === 'object' &&
          solvedByLanguage !== null &&
          Object.keys(solvedByLanguage).length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {Object.entries(solvedByLanguage)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lang, count]) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {getLanguageDisplayName(lang)}: {count}
                  </Badge>
                ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No language data available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStatistics;
