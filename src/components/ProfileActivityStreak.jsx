'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { submissionAPI } from '@/api/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  addDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import ActivityHeatmap from './ActivityHeatmap';
import { motion } from 'framer-motion';

const ProfileActivityStreak = ({ userId }) => {
  const [streakData, setStreakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(
    String(new Date().getFullYear())
  );
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    setAvailableYears(years.map(String));
    setSelectedRange(String(currentYear));
  }, []);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const year =
          selectedRange === String(new Date().getFullYear())
            ? null
            : selectedRange;
        const response = await submissionAPI.getActivityStreakByUserId(
          userId,
          year
        );
        if (response.success) {
          setStreakData(response.data);
        } else {
          toast.error('Failed to fetch activity streak');
          setStreakData(null);
        }
      } catch {
        toast.error('Failed to fetch activity streak');
        setStreakData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreakData();
  }, [userId, selectedRange]);

  const renderHeatmapData = () => {
    if (!streakData) return { displayDays: [], weeks: [] };
    const today = new Date();
    let displayStartDate, displayEndDate;
    if (selectedRange === String(today.getFullYear())) {
      // Find the latest activity date to extend range if needed
      const latestActivityDate =
        streakData.activeDays?.length > 0
          ? new Date(
              Math.max(...streakData.activeDays.map(d => new Date(d.date)))
            )
          : today;

      displayEndDate = endOfWeek(
        latestActivityDate > today ? latestActivityDate : today,
        { weekStartsOn: 1 }
      );
      displayStartDate = addDays(displayEndDate, -364);
      displayStartDate = startOfWeek(displayStartDate, { weekStartsOn: 1 });
    } else {
      const year = parseInt(selectedRange, 10);
      displayStartDate = startOfWeek(startOfYear(new Date(year, 0, 1)), {
        weekStartsOn: 1,
      });
      displayEndDate = endOfWeek(endOfYear(new Date(year, 0, 1)), {
        weekStartsOn: 1,
      });
    }
    const displayDays = eachDayOfInterval({
      start: displayStartDate,
      end: displayEndDate,
    });
    const weeks = [];
    for (let i = 0; i < displayDays.length; i += 7) {
      const week = displayDays.slice(i, i + 7);
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return { displayDays, weeks };
  };

  const { displayDays, weeks } = renderHeatmapData();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/30 rounded-lg w-1/3"></div>
            <div className="h-40 bg-muted/30 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!streakData) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No activity streak data available.
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 border-b border-border/20">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <CardTitle className="text-sm font-medium text-foreground">
            Activity Streak
          </CardTitle>
        </motion.div>
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center text-sm text-muted-foreground gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-foreground">
              Total active days:{' '}
              <span className="font-semibold text-orange-600">
                {streakData.totalActiveDays || 0}
              </span>
            </span>
            <span className="text-foreground">
              Max streak:{' '}
              <span className="font-semibold text-orange-600">
                {streakData.longestStreak || 0}
              </span>
            </span>
          </motion.div>
          <Select
            onValueChange={value => setSelectedRange(value)}
            value={selectedRange}
          >
            <SelectTrigger className="w-[100px] h-8 bg-background border-border">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year === String(new Date().getFullYear()) ? 'Current' : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {streakData?.currentStreak || 0}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Current Streak
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {streakData?.longestStreak || 0}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Longest Streak
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {streakData?.totalActiveDays || 0}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Total Active Days
              </p>
            </div>
          </motion.div>
          <motion.div
            className="relative w-full overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ActivityHeatmap
              displayDays={displayDays}
              weeks={weeks}
              streakData={streakData}
            />
          </motion.div>
        </div>
      </CardContent>
      <div className="absolute bottom-5 left-1/2 right-1/2 -translate-x-1/2 -tracking-y-1/2 items-center flex gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-md bg-amber-500/10 border border-amber-500/20" />
          <div className="w-3 h-3 rounded-md bg-green-300" />
          <div className="w-3 h-3 rounded-md bg-green-400" />
          <div className="w-3 h-3 rounded-md bg-green-500" />
          <div className="w-3 h-3 rounded-md bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

export default ProfileActivityStreak;
