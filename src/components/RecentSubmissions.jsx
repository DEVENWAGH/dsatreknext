'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, ChevronRight, Clock } from 'lucide-react';
import { submissionAPI } from '@/api/api';
import Link from 'next/link';
import { motion } from 'motion/react';

const RecentSubmissions = ({ userId }) => {
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchRecentSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await submissionAPI.getRecentSubmissionsByUserId(
          userId,
          1,
          5
        );
        if (response.success && response.data?.data) {
          setRecentSubmissions(response.data.data.slice(0, 5));
        } else {
          setRecentSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching recent submissions:', error);
        setRecentSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSubmissions();
  }, [userId]);

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'text-green-500';
      case 'wrong answer':
        return 'text-red-500';
      case 'time limit exceeded':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 border-b border-border/20">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-sm font-medium text-foreground">
              Recent Submissions
            </CardTitle>
          </div>
          <Link
            href={`/profile/${userId}/submissions`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`recent-loading-${i}`} className="animate-pulse">
                  <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted/20 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            (() => {
              if (recentSubmissions.length > 0) {
                return (
                  <div className="space-y-4">
                    {recentSubmissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div>
                            <Link
                              href={`/workspace/${submission.problemId}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {submission.problem?.title ||
                                `Problem ${submission.problemId}`}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              <span
                                className={getStatusColor(submission.status)}
                              >
                                {submission.status}
                              </span>
                              {' • '}
                              <span>{submission.language}</span>
                              {submission.runtime && (
                                <>
                                  {' • '}
                                  <span>{submission.runtime}ms</span>
                                </>
                              )}
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
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No submissions yet</p>
                  <p className="text-xs">
                    Your recent submissions will appear here!
                  </p>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentSubmissions;
