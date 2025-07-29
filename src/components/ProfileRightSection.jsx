'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { submissionAPI } from '@/api/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProfileActivityStreak from './ProfileActivityStreak';

const ProfileRightSection = ({ userId }) => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoadingSolved, setIsLoadingSolved] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSolvedProblems = async () => {
      setIsLoadingSolved(true);
      try {
        const response = await submissionAPI.getAllSolvedProblemByUserId(
          userId,
          1,
          5
        );
        if (response.success && response.data) {
          setSolvedProblems(response.data.slice(0, 5));
        } else {
          setSolvedProblems([]);
        }
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        setSolvedProblems([]);
      } finally {
        setIsLoadingSolved(false);
      }
    };

    fetchSolvedProblems();
  }, [userId]);

  const getDifficultyColor = difficulty => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Streak */}
      <ProfileActivityStreak userId={userId} />
      {/* Solved Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-sm font-medium text-foreground">
                Solved Problems
              </CardTitle>
            </div>
            <Link
              href={`/profile/${userId}/solved`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {isLoadingSolved ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={`solved-loading-${i}`} className="animate-pulse">
                    <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                if (solvedProblems.length > 0) {
                  return (
                    <div className="space-y-4">
                      {solvedProblems.map((problem, index) => (
                        <motion.div
                          key={problem.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <div>
                              <Link
                                href={`/workspace/${problem.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors"
                              >
                                {problem.title}
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                <span
                                  className={getDifficultyColor(
                                    problem.difficulty
                                  )}
                                >
                                  {problem.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      No solved problems yet
                    </p>
                    <p className="text-xs">
                      Start solving problems to see them here!
                    </p>
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileRightSection;
