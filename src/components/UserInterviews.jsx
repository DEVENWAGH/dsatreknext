'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Clock, BarChart2, Play, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

const UserInterviews = ({ interviews }) => {
  const router = useRouter();

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const handleStartInterview = (interview, e) => {
    e.stopPropagation();
    router.push(`/start-interview/${interview.id}`);
  };

  const handleViewDetails = (interview, e) => {
    e.stopPropagation();
    router.push(`/interview-details/${interview.id}`);
  };

  // Add safety check for interviews array
  if (!interviews || !Array.isArray(interviews)) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No interviews found</h3>
            <p className="text-muted-foreground">
              Create your first interview to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {interviews.map(interview => (
        <Card
          key={interview.id}
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
          onClick={e => handleViewDetails(interview, e)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                {interview.jobPosition || interview.position || 'Interview'}
              </CardTitle>
              <Badge
                className={`${getStatusColor(interview.status)} font-medium`}
              >
                {interview.status === 'completed'
                  ? '✓ Done'
                  : interview.status === 'in-progress'
                    ? '🔄 Active'
                    : '⏳ Pending'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Target className="w-3 h-3" />
                {interview.interviewType || 'Technical'}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Clock className="w-3 h-3" />
                {interview.duration || '30 min'}
              </Badge>
              <Badge
                className={`${getDifficultyColor(interview.interviewDifficulty || interview.difficulty)} flex items-center gap-1 text-xs`}
              >
                <BarChart2 className="w-3 h-3" />
                {interview.interviewDifficulty ||
                  interview.difficulty ||
                  'medium'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {interview.jobDescription || 'No description available'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {interview.questions?.length || 0} Questions
                </span>
                <span>
                  {interview.createdAt
                    ? new Date(interview.createdAt).toLocaleDateString()
                    : 'Recent'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => handleViewDetails(interview, e)}
                  className="text-xs px-3 py-1 h-8"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {interview.status !== 'completed' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={e => handleStartInterview(interview, e)}
                    className="text-xs px-3 py-1 h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {interview.status === 'in-progress' ? 'Resume' : 'Start'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

UserInterviews.propTypes = {
  interviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      jobPosition: PropTypes.string,
      position: PropTypes.string, // fallback field
      interviewDifficulty: PropTypes.string,
      difficulty: PropTypes.string, // fallback field
      interviewType: PropTypes.string,
      duration: PropTypes.string,
      jobDescription: PropTypes.string,
      status: PropTypes.string.isRequired,
      generatedQuestions: PropTypes.array,
      questions: PropTypes.array, // fallback field
    })
  ).isRequired,
};

export default UserInterviews;
