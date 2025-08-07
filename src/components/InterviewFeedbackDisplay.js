'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Mic,
  Clock,
  Target,
  FileText,
  Download,
  Share2,
  Star,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { formatScoreForDisplay } from '@/services/interviewFeedbackService';
import { toast } from 'sonner';

export default function InterviewFeedbackDisplay({
  interviewData,
  transcript,
  stats,
  service = 'voice',
  onBack,
  onRetakeInterview,
}) {
  const [feedback, setFeedback] = useState(null);
  const [detailedReport, setDetailedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const router = useRouter();

  // Generate feedback on component mount
  useEffect(() => {
    const initializeFeedback = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/interview/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript,
            interviewData,
            stats,
            service,
            generateReport: true,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate feedback');
        }

        if (data.success) {
          setFeedback(data.feedback);
          setDetailedReport(data.report);
          toast.success('Interview feedback generated successfully!');
        } else {
          throw new Error('Failed to generate feedback');
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        setError(error.message);
        toast.error('Failed to generate feedback');
      } finally {
        setIsLoading(false);
      }
    };

    initializeFeedback();
  }, [transcript, interviewData, stats, service]);

  const generateFeedback = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          interviewData,
          stats,
          service,
          generateReport: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate feedback');
      }

      if (data.success) {
        setFeedback(data.feedback);
        setDetailedReport(data.report);
        toast.success('Interview feedback generated successfully!');
      } else {
        throw new Error('Failed to generate feedback');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      setError(error.message);
      toast.error('Failed to generate feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!detailedReport) return;

    const blob = new Blob([detailedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${interviewData.candidateName}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  const shareResults = async () => {
    if (navigator.share && feedback) {
      try {
        await navigator.share({
          title: `Interview Results - ${interviewData.position}`,
          text: `Interview completed for ${interviewData.position}. Overall Score: ${feedback.overallScore}/10`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const summary = `Interview Results for ${interviewData.position}\nOverall Score: ${feedback?.overallScore}/10\nRecommendation: ${feedback?.hiringRecommendation}`;
      navigator.clipboard.writeText(summary);
      toast.success('Results copied to clipboard!');
    }
  };

  const ScoreCard = ({ title, score, description, icon: Icon }) => {
    const scoreDisplay = formatScoreForDisplay(score);

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-gray-600" />
              <span className="font-medium">{title}</span>
            </div>
            <Badge variant="outline" className={scoreDisplay.color}>
              {score}/10 - {scoreDisplay.label}
            </Badge>
          </div>
          <div className="mt-2">
            <Progress value={score * 10} className="w-full h-2" />
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold">
                  Analyzing Your Interview
                </h3>
                <p className="text-muted-foreground">
                  Our AI is analyzing your performance and generating detailed
                  feedback...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !feedback) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to generate feedback: {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={generateFeedback}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Interview Feedback</h1>
            <p className="text-muted-foreground">
              {interviewData.position} - {interviewData.candidateName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={shareResults}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {detailedReport && (
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
          <Button onClick={onRetakeInterview}>Retake Interview</Button>
        </div>
      </div>

      {/* Overall Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {feedback?.overallScore || 0}/10
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {feedback?.hiringRecommendation || 'Under Review'}
              </div>
              <div className="text-sm text-muted-foreground">
                Recommendation
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {feedback?.estimatedLevel || 'Intermediate'}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Level
              </div>
            </div>
          </div>

          {feedback?.overallFeedback && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-center">{feedback.overallFeedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="voice">Voice Analysis</TabsTrigger>
          <TabsTrigger value="questions">Q&A Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="Technical Skills"
              score={feedback?.technicalSkills?.score || 0}
              description={feedback?.technicalSkills?.feedback}
              icon={Target}
            />
            <ScoreCard
              title="Communication"
              score={feedback?.communicationSkills?.score || 0}
              description={feedback?.communicationSkills?.feedback}
              icon={Mic}
            />
            <ScoreCard
              title="Problem Solving"
              score={feedback?.problemSolving?.score || 0}
              description={feedback?.problemSolving?.feedback}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback?.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  )) || <li>No strengths identified</li>}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback?.areasForImprovement?.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  )) || <li>No areas identified</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voice Analysis Tab */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Interview Specific Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Speech Clarity</span>
                      <span className="text-sm font-semibold">
                        {feedback?.voiceInterviewSpecific?.speechClarity || 0}
                        /10
                      </span>
                    </div>
                    <Progress
                      value={
                        (feedback?.voiceInterviewSpecific?.speechClarity || 0) *
                        10
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Confidence Level</span>
                      <span className="text-sm font-semibold">
                        {feedback?.voiceInterviewSpecific?.confidenceLevel || 0}
                        /10
                      </span>
                    </div>
                    <Progress
                      value={
                        (feedback?.voiceInterviewSpecific?.confidenceLevel ||
                          0) * 10
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Response Timing</h4>
                    <p className="text-sm text-muted-foreground">
                      {feedback?.voiceInterviewSpecific?.responseTime ||
                        'No timing analysis available'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Voice Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      {feedback?.voiceInterviewSpecific?.voiceQuality ||
                        'No voice quality analysis available'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A Analysis Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Question-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback?.questionwiseAnalysis?.length > 0 ? (
                <div className="space-y-4">
                  {feedback.questionwiseAnalysis.map((qa, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Badge variant="outline">{qa.score}/10</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Q:</strong> {qa.question}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>A:</strong> {qa.response}
                      </p>
                      <p className="text-sm text-blue-600">
                        <strong>Feedback:</strong> {qa.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed question analysis not available</p>
                  <p className="text-sm">
                    This feature requires comprehensive transcript analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback?.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm">{rec}</span>
                    </li>
                  )) || <li>No recommendations available</li>}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback?.nextSteps?.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </li>
                  )) || <li>No next steps available</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Interview Transcript
                <Badge variant="outline">
                  {transcript?.length || 0} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transcript && transcript.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'candidate' ||
                        message.role === 'user' ||
                        message.speaker === 'Candidate'
                          ? 'bg-blue-50 border-l-4 border-blue-500 ml-4'
                          : 'bg-gray-50 border-l-4 border-gray-500 mr-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            message.role === 'candidate' ||
                            message.role === 'user' ||
                            message.speaker === 'Candidate'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {message.speaker ||
                            (message.role === 'candidate' ||
                            message.role === 'user'
                              ? 'You'
                              : 'Interviewer')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp
                            ? new Date(message.timestamp).toLocaleTimeString()
                            : `Message ${index + 1}`}
                        </span>
                      </div>
                      <p className="text-sm">
                        {message.content || message.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transcript available</p>
                  <p className="text-sm">
                    The interview transcript could not be retrieved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interview Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalMessages || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Messages
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.candidateResponses || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Your Responses
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.duration || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration (min)
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {service.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Service Used
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
