'use client';

import { useState, useCallback, useEffect } from 'react';
import { authAPI, submissionAPI } from '@/api/api';

export const useUserAnalytics = userId => {
  const [analytics, setAnalytics] = useState({
    statistics: null,
    streak: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchAnalytics = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      // Don't refetch if data is fresh (less than 5 minutes old) unless forced
      if (!forceRefresh && analytics.lastUpdated) {
        const timeDiff = Date.now() - analytics.lastUpdated;
        if (timeDiff < 5 * 60 * 1000) {
          return;
        }
      }

      setAnalytics(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const [statsResponse, streakResponse] = await Promise.all([
          authAPI.getUserStatistics(userId),
          submissionAPI.getActivityStreakByUserId(userId),
        ]);

        const statistics = statsResponse.success ? statsResponse.data : null;
        const streak = streakResponse.success ? streakResponse.data : null;

        setAnalytics({
          statistics,
          streak,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        });

        return { statistics, streak };
      } catch (error) {
        console.error('Error fetching user analytics:', error);
        setAnalytics(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }
    },
    [userId, analytics.lastUpdated]
  );

  const refreshAnalytics = useCallback(() => {
    return fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Calculate derived metrics
  const derivedMetrics = {
    acceptanceRate:
      analytics.statistics?.totalSubmissions > 0
        ? analytics.statistics.acceptanceRate
        : 0,
    totalProblemsAttempted: analytics.statistics?.totalSubmissions || 0,
    averageSubmissionsPerProblem:
      analytics.statistics?.totalSolved > 0
        ? (
            analytics.statistics.totalSubmissions /
            analytics.statistics.totalSolved
          ).toFixed(1)
        : 0,
    streakPercentage:
      analytics.streak?.totalActiveDays > 0
        ? (
            (analytics.streak.currentStreak /
              analytics.streak.totalActiveDays) *
            100
          ).toFixed(1)
        : 0,
    difficultyDistribution: analytics.statistics?.solvedByDifficulty
      ? {
          easy:
            analytics.statistics.totalSolved > 0
              ? (
                  (analytics.statistics.solvedByDifficulty.easy /
                    analytics.statistics.totalSolved) *
                  100
                ).toFixed(1)
              : 0,
          medium:
            analytics.statistics.totalSolved > 0
              ? (
                  (analytics.statistics.solvedByDifficulty.medium /
                    analytics.statistics.totalSolved) *
                  100
                ).toFixed(1)
              : 0,
          hard:
            analytics.statistics.totalSolved > 0
              ? (
                  (analytics.statistics.solvedByDifficulty.hard /
                    analytics.statistics.totalSolved) *
                  100
                ).toFixed(1)
              : 0,
        }
      : { easy: 0, medium: 0, hard: 0 },
    mostUsedLanguage:
      analytics.statistics?.solvedByLanguage &&
      typeof analytics.statistics.solvedByLanguage === 'object' &&
      analytics.statistics.solvedByLanguage !== null
        ? Object.entries(analytics.statistics.solvedByLanguage).reduce(
            (a, b) =>
              analytics.statistics.solvedByLanguage[a[0]] >
              analytics.statistics.solvedByLanguage[b[0]]
                ? a
                : b,
            ['none', 0]
          )[0]
        : null,
    languageCount:
      analytics.statistics?.solvedByLanguage &&
      typeof analytics.statistics.solvedByLanguage === 'object' &&
      analytics.statistics.solvedByLanguage !== null
        ? Object.keys(analytics.statistics.solvedByLanguage).length
        : 0,
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...analytics,
    derivedMetrics,
    refreshAnalytics,
    isStale:
      analytics.lastUpdated &&
      Date.now() - analytics.lastUpdated > 5 * 60 * 1000,
  };
};

export default useUserAnalytics;
