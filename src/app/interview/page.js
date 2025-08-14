'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PlusCircle, Loader2 } from 'lucide-react';
import InterviewForm from '@/components/InterviewForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useInterviews, useCreateInterview } from '@/hooks/useInterview';
import UserInterviews from '@/components/UserInterviews';
import { useSession } from 'next-auth/react';
import SplineModel from '@/components/SplineModel';

// Component that handles search params
function SearchParamsHandler({ setIsDialogOpen }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const isRetry = searchParams.get('retry');
    if (isRetry === 'true') {
      console.log(
        '🔄 Detected retry parameter - this is deprecated. New interviews now reuse existing data.'
      );
      setIsDialogOpen(true);
    }
  }, [searchParams, setIsDialogOpen]);

  return null;
}

const Interview = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = useSession();

  const { data: userInterviews = [], isLoading } = useInterviews();
  const createInterviewMutation = useCreateInterview();
  const isCreating = createInterviewMutation.isPending;

  const onSubmit = async data => {
    try {
      if (!session?.user?.id) {
        toast.error('Please log in to create an interview');
        return;
      }

      // Clear any corrupted localStorage first
      try {
        localStorage.removeItem('interview-storage');
      } catch (e) {
        console.log('Could not clear localStorage:', e);
      }

      const interviewData = {
        userId: session.user.id,
        position: data.jobPosition,
        companyName: data.companyName,
        jobDescription: data.jobDescription,
        interviewType: data.interviewType,
        duration: data.duration,
        difficulty: data.interviewDifficulty,
        questions: [],
        interviewerName: null,
        scheduledAt: null,
      };

      console.log('Submitting interview data:', interviewData);

      createInterviewMutation.mutate(interviewData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success('Interview created successfully!');
        },
        onError: error => {
          toast.error(`Failed to create interview: ${error.message}`);
        },
      });
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error(`Failed to create interview: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <SearchParamsHandler setIsDialogOpen={setIsDialogOpen} />
      </Suspense>
      <div className="container mx-auto p-4 max-w-6xl min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold">Interviews</h1>
          {/* Always show create interview button regardless of existing interviews */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Create Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Create New Interview
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto pr-1" data-lenis-prevent>
                <InterviewForm onSubmit={onSubmit} isCreating={isCreating} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isCreating && (
          <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <AlertTitle className="text-blue-700 dark:text-blue-300 font-semibold">
                  🤖 Generating Your Interview
                </AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  Our AI is creating personalized questions based on your job
                  description. This typically takes 10-30 seconds...
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !userInterviews || userInterviews.length === 0 ? (
            <div className="flex gap-12 items-center w-full max-h-full">
              <div className="flex-1 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Master Your Next Interview
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                      Practice with AI-powered mock interviews tailored to your
                      role. Get real-time feedback and boost your confidence
                      with our advanced voice interview system.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            🧠
                          </span>
                        </div>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                          AI-Powered
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Personalized questions based on job description
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            🎙️
                          </span>
                        </div>
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          Voice Interview
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Real-time voice interaction with AI interviewer
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            📊
                          </span>
                        </div>
                        <span className="font-semibold text-purple-900 dark:text-purple-100">
                          Smart Feedback
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Detailed analysis and improvement suggestions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="text-lg px-12 py-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <PlusCircle className="w-6 h-6 mr-3" />
                        Start Your First Interview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                          Create New Interview
                        </DialogTitle>
                      </DialogHeader>
                      <InterviewForm
                        onSubmit={onSubmit}
                        isCreating={isCreating}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="hidden lg:block flex-1">
                <SplineModel />
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Your Interviews</h2>
                    <p className="text-muted-foreground">
                      Manage and track your interview progress
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                    {userInterviews.length} interview
                    {userInterviews.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <UserInterviews interviews={userInterviews || []} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
