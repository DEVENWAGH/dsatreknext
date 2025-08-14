'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import ReactMarkdown from 'react-markdown';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
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
  Brain,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export default function InterviewDetailsPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Add ref to prevent multiple feedback generation attempts
  const feedbackGenerationRef = useRef(false);
  const feedbackTimeoutRef = useRef(null);

  const { getInterviewById, getInterviewFromCache } = useInterviewStore();

  console.log(`🎯 Interview Details Page loaded for ID: ${interviewId}`);

  useEffect(() => {
    const checkAndGenerateFeedback = async interviewData => {
      // Prevent multiple simultaneous feedback generation
      if (feedbackGenerationRef.current || isGeneratingFeedback) {
        console.log('🚫 Feedback generation already in progress, skipping...');
        return;
      }

      if (interviewData.status === 'completed' && !interviewData.feedback) {
        console.log(
          '🤖 Generating missing feedback for completed interview...'
        );

        feedbackGenerationRef.current = true;
        setIsGeneratingFeedback(true);

        // Set a timeout to prevent indefinite loading
        feedbackTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Feedback generation timeout');
          setIsGeneratingFeedback(false);
          feedbackGenerationRef.current = false;
        }, 30000); // 30 second timeout

        try {
          const feedbackResponse = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              position: interviewData.position || 'Software Developer',
              duration: interviewData.duration || '30 min',
              completionRate: 100,
              interviewType:
                interviewData.interviewType || 'Technical Interview',
              difficulty: interviewData.difficulty || 'medium',
              questionsCount: (interviewData.questions || []).length,
              transcript: interviewData.transcript || [], // Use stored transcript
              interviewId: interviewId, // Add for caching
            }),
          });

          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            console.log('✅ Feedback generated successfully');

            // Update interview with feedback
            const updateResponse = await fetch(
              `/api/interviews/${interviewId}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: feedbackData.feedback }),
              }
            );

            if (updateResponse.ok) {
              const updatedInterview = await updateResponse.json();
              setInterview(updatedInterview.interview);
              console.log('💾 Feedback saved to database');
            }
          } else {
            console.error(
              '❌ Failed to generate feedback:',
              await feedbackResponse.text()
            );
          }
        } catch (error) {
          console.error('❌ Error generating feedback:', error);
        } finally {
          // Clear timeout and reset flags
          if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
          }
          setIsGeneratingFeedback(false);
          feedbackGenerationRef.current = false;
        }
      }
    };

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
          console.log('✅ Using cached interview');
          setInterview(cachedInterview);
          setLoading(false);

          // Only generate feedback if needed, with a small delay to prevent race conditions
          setTimeout(() => checkAndGenerateFeedback(cachedInterview), 500);
          return;
        }

        // If not in cache, fetch from API
        console.log('📡 Fetching interview from API');
        const fetchedInterview = await getInterviewById(interviewId);

        if (fetchedInterview) {
          console.log('✅ Fetched interview successfully');
          setInterview(fetchedInterview);

          // Only generate feedback if needed, with a small delay
          setTimeout(() => checkAndGenerateFeedback(fetchedInterview), 500);
        } else {
          console.error('❌ Interview not found');
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

    // Cleanup function
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackGenerationRef.current = false;
    };
  }, [
    interviewId,
    getInterviewById,
    getInterviewFromCache,
    isGeneratingFeedback,
  ]);

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

  const handleTryAgain = async () => {
    try {
      console.log(
        '🔄 Reusing existing interview for retry - saving Gemini API calls'
      );

      // Reset interview status to pending to allow restart
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pending',
          feedback: null, // Clear previous feedback
          transcript: [], // Clear previous transcript
          conversation: [], // Clear previous conversation
          stats: null, // Clear previous stats
        }),
      });

      if (response.ok) {
        console.log('✅ Interview reset successfully');
        toast.success(
          'Interview reset! You can try again with the same questions.'
        );

        // Navigate directly to start interview page with existing data
        router.push(`/start-interview/${interviewId}`);
      } else {
        console.error('❌ Failed to reset interview');
        toast.error('Failed to reset interview. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting interview:', error);
      toast.error('Error resetting interview. Please try again.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto py-6 max-w-6xl min-h-screen">
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

            <div className="flex items-center gap-3">
              {interview.status === 'completed' && (
                <Button
                  onClick={handleTryAgain}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Same Interview
                </Button>
              )}

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
        </div>

        {/* AI Interview Feedback - Shows feedback from interview record */}
        {interview.status === 'completed' && (
          <Card className="mb-6 flex-1 min-h-0 border-2">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                AI Interview Feedback
                {isGeneratingFeedback && (
                  <Badge variant="secondary" className="ml-2 animate-pulse">
                    🤖 Generating...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Professional feedback generated by AI based on your interview
                performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100vh-280px)] overflow-hidden flex flex-col p-0">
              {isGeneratingFeedback ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-xl text-blue-600 dark:text-blue-400">
                        🤖 Analyzing Your Interview
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our advanced AI is carefully reviewing your responses
                        and generating personalized feedback. This process
                        typically takes 5-15 seconds...
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-4 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        💡 Tip: Your feedback will include strengths, areas for
                        improvement, and actionable recommendations
                      </div>
                    </div>
                  </div>
                </div>
              ) : interview.feedback ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* AI Assistant Header */}
                  <div className="flex items-center gap-3 mb-4 px-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          AI Interview Analyst
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Professional Feedback Report
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Feedback Content */}
                  <SmoothScroll className="flex-1 px-6 pb-6 custom-scrollbar">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-0">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {typeof interview.feedback === 'object' &&
                          interview.feedback !== null ? (
                            <div className="space-y-4 p-4">
                              {Object.entries(interview.feedback).map(
                                ([key, value]) => (
                                  <div key={key} className="mb-6">
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 capitalize mb-3 text-base flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      {key
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str =>
                                          str.toUpperCase()
                                        )}
                                    </h4>
                                    <div className="text-muted-foreground pl-4 border-l-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10 rounded-r-lg p-3">
                                      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-blue-600 dark:prose-headings:text-blue-400 prose-strong:text-blue-700 dark:prose-strong:text-blue-300 prose-ul:list-none prose-li:relative prose-li:pl-6 prose-li:before:content-['✅'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-green-500">
                                        <ReactMarkdown
                                          components={{
                                            h1: ({ children }) => (
                                              <h1 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                                                {children}
                                              </h1>
                                            ),
                                            h2: ({ children }) => (
                                              <h2 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                                                {children}
                                              </h2>
                                            ),
                                            h3: ({ children }) => (
                                              <h3 className="text-base font-medium mb-2 text-blue-600 dark:text-blue-400">
                                                {children}
                                              </h3>
                                            ),
                                            p: ({ children }) => (
                                              <p className="mb-3 text-sm leading-relaxed">
                                                {children}
                                              </p>
                                            ),
                                            ul: ({ children }) => (
                                              <ul className="space-y-2 mb-4">
                                                {children}
                                              </ul>
                                            ),
                                            li: ({ children }) => (
                                              <li className="flex items-start gap-2 text-sm">
                                                <span className="text-green-500 mt-1">
                                                  ✅
                                                </span>
                                                <span>{children}</span>
                                              </li>
                                            ),
                                            strong: ({ children }) => (
                                              <strong className="font-semibold text-blue-700 dark:text-blue-300">
                                                {children}
                                              </strong>
                                            ),
                                          }}
                                        >
                                          {value}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-blue-600 dark:prose-headings:text-blue-400 prose-strong:text-blue-700 dark:prose-strong:text-blue-300 prose-p:text-sm prose-p:leading-relaxed prose-ul:space-y-1 prose-li:text-sm">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => (
                                      <div className="mb-6 pb-3 border-b border-blue-200 dark:border-blue-800">
                                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-3">
                                          <Brain className="w-6 h-6" />
                                          {children}
                                        </h1>
                                      </div>
                                    ),
                                    h2: ({ children }) => (
                                      <div className="mb-4 mt-6">
                                        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                          {children}
                                        </h2>
                                      </div>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-base font-medium mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="space-y-2 mb-4 ml-4">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="space-y-2 mb-4 ml-4 list-decimal">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => {
                                      // Check if the content starts with a checkmark or bullet
                                      const childrenText =
                                        typeof children === 'string'
                                          ? children
                                          : Array.isArray(children) &&
                                              typeof children[0] === 'string'
                                            ? children[0]
                                            : '';

                                      if (
                                        childrenText.includes('✅') ||
                                        childrenText.includes('- ✅')
                                      ) {
                                        return (
                                          <li className="flex items-start gap-2 text-sm">
                                            <span className="text-green-500 mt-1">
                                              ✅
                                            </span>
                                            <span className="text-muted-foreground">
                                              {children
                                                .toString()
                                                .replace(/✅\s*/, '')
                                                .replace(/^-\s*/, '')}
                                            </span>
                                          </li>
                                        );
                                      }

                                      return (
                                        <li className="flex items-start gap-2 text-sm">
                                          <span className="text-blue-500 mt-1">
                                            •
                                          </span>
                                          <span className="text-muted-foreground">
                                            {children}
                                          </span>
                                        </li>
                                      );
                                    },
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-blue-700 dark:text-blue-300">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-muted-foreground">
                                        {children}
                                      </em>
                                    ),
                                    code: ({ children }) => (
                                      <code className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded text-xs font-mono">
                                        {children}
                                      </code>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-blue-300 dark:border-blue-700 pl-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-r-lg my-4">
                                        {children}
                                      </blockquote>
                                    ),
                                  }}
                                >
                                  {interview.feedback}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </SmoothScroll>

                  {/* Fixed Footer with Badges */}
                  <div className="flex items-center justify-between pt-4 px-6 pb-2 border-t bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Analysis completed using advanced AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Brain className="w-3 h-3" />
                        AI Powered
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        Generated Today
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">
                        No Feedback Available Yet
                      </h3>
                      <p className="text-sm max-w-md mx-auto leading-relaxed">
                        Complete your interview to receive detailed AI-powered
                        feedback and performance analysis
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg max-w-sm mx-auto">
                        <p className="text-xs text-muted-foreground">
                          💡 Feedback includes: Performance scoring, strengths
                          analysis, improvement suggestions, and interview tips
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                {interview.status === 'completed' && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                    💡 Clicking &quote;Retry Same Interview&quot; will use the
                    exact same questions - no new API calls needed!
                  </span>
                )}
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
        </div>

        {/* Action Buttons Section */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {interview.status === 'completed' ? (
                <>
                  <Button
                    onClick={handleTryAgain}
                    size="lg"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Same Interview
                  </Button>
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Interviews
                  </Button>
                </>
              ) : interview.status === 'pending' ||
                interview.status === 'scheduled' ? (
                <>
                  <Button
                    onClick={handleStartInterview}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Interview
                  </Button>
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Interviews
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Interviews
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
