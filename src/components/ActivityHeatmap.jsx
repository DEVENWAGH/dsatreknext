'use client';

import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ActivityHeatmap = ({ weeks, streakData }) => {
  const heatmapContainerRef = useRef(null);

  // Auto-scroll to show recent activity
  useEffect(() => {
    if (heatmapContainerRef.current && weeks.length > 0) {
      // Scroll to the end (most recent weeks) after a short delay to ensure rendering is complete
      const timer = setTimeout(() => {
        heatmapContainerRef.current.scrollLeft =
          heatmapContainerRef.current.scrollWidth;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [weeks, streakData]);

  const getColorIntensity = count => {
    if (count === 0) return 'bg-amber-500/10 border border-amber-500/20';
    if (count >= 4) return 'bg-green-600';
    if (count >= 3) return 'bg-green-500';
    if (count >= 2) return 'bg-green-400';
    if (count >= 1) return 'bg-green-300';
    return 'bg-amber-500/10 border border-amber-500/20';
  };

  const heatmapColumns = weeks.map((week, weekIndex) => (
    <motion.div
      key={weekIndex}
      className="flex flex-col gap-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: weekIndex * 0.05 }}
    >
      {week.map((day, dayIndex) => {
        if (!day) return <div key={dayIndex} className="w-4 h-4" />;

        const dateString =
          day.getFullYear() +
          '-' +
          String(day.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(day.getDate()).padStart(2, '0'); // Use local date format to avoid timezone issues

        // Get submission count for this date
        let submissionCount = 0;

        // Try heatmapData first (more reliable), then activeDays
        if (streakData?.heatmapData && streakData.heatmapData[dateString]) {
          submissionCount = streakData.heatmapData[dateString];
        } else if (streakData?.activeDays) {
          const activityDay = streakData.activeDays.find(d => {
            const activityDateString =
              typeof d.date === 'string'
                ? d.date
                : new Date(d.date).toISOString().split('T')[0];
            return activityDateString === dateString;
          });
          submissionCount = activityDay?.count || 0;
        }

        return (
          <TooltipProvider key={dayIndex}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className={`w-4 h-4 rounded-md ${getColorIntensity(
                    submissionCount
                  )} 
                    hover:scale-110 transition-all duration-200 cursor-pointer
                    hover:shadow-md hover:shadow-primary/20`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-background border border-border shadow-lg"
              >
                <p className="font-medium">{format(day, 'MMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">
                  {submissionCount}{' '}
                  {submissionCount === 1 ? 'submission' : 'submissions'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </motion.div>
  ));

  const dayLabels = ['Mon', 'Wed', 'Fri'];
  const labelIndices = [0, 2, 4];

  const dayLabelElements = Array.from({ length: 7 }, (_, index) => {
    const labelText = labelIndices.includes(index)
      ? dayLabels[labelIndices.indexOf(index)]
      : '';

    return (
      <motion.div
        key={index}
        className="text-xs text-muted-foreground h-4 flex items-center justify-end pr-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {labelText}
      </motion.div>
    );
  });

  return (
    <div className="flex overflow-hidden bg-card/50 rounded-lg p-4">
      {/* Vertical Day Labels */}
      <div className="flex flex-col gap-1 pr-2 w-12 flex-shrink-0">
        {dayLabelElements}
      </div>

      {/* Heatmap Grid */}
      <div
        ref={heatmapContainerRef}
        className="flex flex-row items-start gap-1 overflow-x-auto flex-grow min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {heatmapColumns}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
