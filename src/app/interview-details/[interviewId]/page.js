'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Clock,
  Target,
  FileText,
  BarChart2,
  ArrowLeft,
  Mic,
  MessageSquare,
  Calendar,
} from 'lucide-react';

export default function InterviewDetailsPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getInterviewById, getInterviewFromCache } = useInterviewStore();

  console.log(`🎯 Interview Details Page loaded for ID: ${interviewId}`);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) {
        console.error('❌ No interview ID provided');
        setError('No interview ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 Loading interview details for ID: ${interviewId}`);
        setLoading(true);

        // First try to get from cache
        const cachedInterview = getInterviewFromCache(interviewId);
        if (cachedInterview) {
          console.log('✅ Using cached interview:', cachedInterview);
          setInterview(cachedInterview);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        console.log('📡 Fetching interview from API:', interviewId);
        const fetchedInterview = await getInterviewById(interviewId);

        if (fetchedInterview) {
          console.log('✅ Fetched interview successfully:', fetchedInterview);
          setInterview(fetchedInterview);
        } else {
          console.error('❌ Interview not found in API response');
          setError('Interview not found');
        }
      } catch (error) {
        console.error('❌ Error fetching interview:', error);
        setError(`Failed to load interview data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, getInterviewById, getInterviewFromCache]);

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStartInterview = () => {
    router.push(`/start-interview/${interviewId}`);
  };

  const handleGoBack = () => {
    router.push('/interview');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Interview Not Found
          </h2>
          <p className="text-muted-foreground">
            {error || "The interview you're looking for doesn't exist."}
          </p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button onClick={handleGoBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Interviews
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {interview.position || 'Interview'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {interview.companyName && `at ${interview.companyName}`}
            </p>
          </div>

          {interview.status !== 'completed' && (
            <Button
              onClick={handleStartInterview}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {interview.status === 'in-progress'
                ? 'Resume Interview'
                : 'Start Interview'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Interview Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Interview Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(interview.status)}>
                {interview.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {interview.interviewType || 'Technical Interview'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duration:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {interview.duration || '30 min'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Difficulty:</span>
              <Badge className={getDifficultyColor(interview.difficulty)}>
                <BarChart2 className="w-3 h-3 mr-1" />
                {interview.difficulty || 'medium'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {interview.createdAt
                  ? new Date(interview.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {interview.jobDescription || 'No job description provided.'}
            </p>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Questions ({(interview.questions || []).length})
            </CardTitle>
            <CardDescription>
              These questions will be covered during your interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interview.questions && interview.questions.length > 0 ? (
              <div className="space-y-4">
                {interview.questions.map((question, index) => (
                  <div
                    key={`question-${interviewId}-${index}`}
                    className="p-4 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm leading-relaxed">
                          {typeof question === 'string'
                            ? question
                            : question.question || 'Question not available'}
                        </p>
                        {typeof question === 'object' && (
                          <div className="flex gap-2 flex-wrap">
                            {question.type && (
                              <Badge variant="secondary" className="text-xs">
                                {question.type}
                              </Badge>
                            )}
                            {question.category && (
                              <Badge variant="outline" className="text-xs">
                                {question.category}
                              </Badge>
                            )}
                            {question.difficulty && (
                              <Badge
                                className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                              >
                                {question.difficulty}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No questions generated yet</p>
                <p className="text-sm">
                  Questions will be generated when you start the interview
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Metadata */}
        {(interview.companyName ||
          interview.interviewerName ||
          interview.scheduledAt) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interview.companyName && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{interview.companyName}</span>
                </div>
              )}
              {interview.interviewerName && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interviewer:</span>
                  <span className="font-medium">
                    {interview.interviewerName}
                  </span>
                </div>
              )}
              {interview.scheduledAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feedback (if completed) */}
        {interview.status === 'completed' && interview.feedback && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Interview Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typeof interview.feedback === 'object' ? (
                  Object.entries(interview.feedback).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-medium capitalize mb-2">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <p className="text-muted-foreground">{value}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{interview.feedback}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
