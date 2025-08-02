'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart2,
  Trophy,
  CheckCircle2,
  Flame,
  Calendar,
  Target,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

const UserAnalytics = ({ userId }) => {
  const {
    statistics,
    streak,
    isLoading,
    derivedMetrics,
    refreshAnalytics,
    isStale,
  } = useUserAnalytics(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = statistics || {};
  const streakData = streak || {};

  // Use derived metrics from the hook
  const acceptanceRate = derivedMetrics.acceptanceRate;

  const analyticsCards = [
    {
      title: 'Current Streak',
      value: streakData.currentStreak || 0,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Longest Streak',
      value: streakData.longestStreak || 0,
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'from-amber-500/10 to-yellow-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Total Active Days',
      value: streakData.totalActiveDays || 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Problems Solved',
      value: stats.totalSolved || 0,
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions || 0,
      icon: CheckCircle2,
      color: 'text-purple-500',
      bgColor: 'from-purple-500/10 to-violet-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Acceptance Rate',
      value: `${acceptanceRate}%`,
      icon: BarChart2,
      color: 'text-indigo-500',
      bgColor: 'from-indigo-500/10 to-blue-500/10',
      borderColor: 'border-indigo-500/20',
    },
  ];

  // Difficulty breakdown
  const difficultyStats = stats.solvedByDifficulty || {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">User Analytics</h3>
          {isStale && (
            <span className="text-xs text-muted-foreground bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
              Data may be outdated
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAnalytics}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className={`bg-gradient-to-br ${card.bgColor} backdrop-blur-sm border ${card.borderColor} hover:shadow-lg transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Difficulty Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Solved by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-500">
                  {difficultyStats.easy}
                </div>
                <div className="text-sm text-green-600/70">Easy</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-500">
                  {difficultyStats.medium}
                </div>
                <div className="text-sm text-yellow-600/70">Medium</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-2xl font-bold text-red-500">
                  {difficultyStats.hard}
                </div>
                <div className="text-sm text-red-600/70">Hard</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Breakdown */}
      {stats.solvedByLanguage &&
        typeof stats.solvedByLanguage === 'object' &&
        stats.solvedByLanguage !== null &&
        Object.keys(stats.solvedByLanguage).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  Solved by Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.solvedByLanguage).map(
                    ([language, count]) => (
                      <div
                        key={language}
                        className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-full border border-border/50 hover:bg-background/80 transition-colors"
                      >
                        <span className="text-sm font-medium capitalize">
                          {language}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  );
};

export default UserAnalytics;
