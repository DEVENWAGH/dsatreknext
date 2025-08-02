'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Award,
  Code,
  Calendar,
  PieChart,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

const AnalyticsDashboard = ({ userId }) => {
  const { statistics, streak, derivedMetrics, isLoading } =
    useUserAnalytics(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = statistics || {};
  const streakData = streak || {};
  const metrics = derivedMetrics || {};

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Problems Solved
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalSolved || 0}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(((stats.totalSolved || 0) / 100) * 100, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalSolved || 0} of 100+ problems
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Acceptance Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics.acceptanceRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={parseFloat(metrics.acceptanceRate) || 0}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalSolved || 0} accepted /{' '}
                  {stats.totalSubmissions || 0} total
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {streakData.currentStreak || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={
                    streakData.longestStreak
                      ? (streakData.currentStreak / streakData.longestStreak) *
                        100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Best: {streakData.longestStreak || 0} days
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Days
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {streakData.totalActiveDays || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4">
                <Progress
                  value={Math.min(
                    ((streakData.totalActiveDays || 0) / 365) * 100,
                    100
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This year: {streakData.totalActiveDays || 0} days
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Difficulty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Easy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.solvedByDifficulty?.easy || 0}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.difficultyDistribution?.easy || 0}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={parseFloat(metrics.difficultyDistribution?.easy) || 0}
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.solvedByDifficulty?.medium || 0}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.difficultyDistribution?.medium || 0}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={
                    parseFloat(metrics.difficultyDistribution?.medium) || 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Hard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.solvedByDifficulty?.hard || 0}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.difficultyDistribution?.hard || 0}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={parseFloat(metrics.difficultyDistribution?.hard) || 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Programming Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Languages Used</span>
                  <Badge variant="secondary">
                    {metrics.languageCount || 0}
                  </Badge>
                </div>

                {metrics.mostUsedLanguage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Used</span>
                    <Badge variant="default" className="capitalize">
                      {metrics.mostUsedLanguage}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  {stats.solvedByLanguage &&
                    typeof stats.solvedByLanguage === 'object' &&
                    stats.solvedByLanguage !== null &&
                    Object.entries(stats.solvedByLanguage)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([language, count]) => (
                        <div
                          key={language}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm capitalize">{language}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(stats.solvedByLanguage))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground w-6 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
