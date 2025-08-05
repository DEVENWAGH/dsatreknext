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
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">No interviews found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {interviews.map(interview => (
        <Card
          key={interview.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="text-xl">
              {interview.jobPosition || interview.position || 'Interview'}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {interview.interviewType || 'Technical Interview'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {interview.duration || '30 min'}
              </Badge>
              <Badge
                className={`${getDifficultyColor(interview.interviewDifficulty || interview.difficulty)} flex items-center gap-1`}
              >
                <BarChart2 className="w-4 h-4" />
                {interview.interviewDifficulty ||
                  interview.difficulty ||
                  'medium'}
              </Badge>
              <Badge className={getStatusColor(interview.status)}>
                {interview.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-2">
              {interview.jobDescription || 'No description available'}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <Badge variant="secondary">
                {interview.questions?.length || 0} Questions
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => handleViewDetails(interview, e)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                {interview.status !== 'completed' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={e => handleStartInterview(interview, e)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Play className="w-4 h-4 mr-1" />
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
