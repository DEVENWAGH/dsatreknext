'use client';

import React, { useEffect, useState } from 'react';
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
import { useInterviewStore } from '@/store/interviewStore';
import UserInterviews from '@/components/UserInterviews';
import { useSession } from 'next-auth/react';
import SplineModel from '@/components/SplineModel';

const Interview = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = useSession();

  const {
    userInterviews,
    isLoading,
    isCreating,
    getUserInterviews,
    createInterview,
  } = useInterviewStore();

  useEffect(() => {
    if (session?.user?.id) {
      getUserInterviews(session.user.id);
    }
  }, [getUserInterviews, session?.user?.id]);

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

      const result = await createInterview(interviewData);
      if (result) {
        setIsDialogOpen(false);
        toast.success('Interview created successfully!');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error(`Failed to create interview: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interviews</h1>
        {userInterviews && userInterviews.length > 0 && (
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
        )}
      </div>

      {isCreating && (
        <Alert className="mb-6 bg-primary/10 border-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Generating Your Interview</AlertTitle>
          <AlertDescription>
            Please wait while we generate your interview questions. This may
            take a few moments.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !userInterviews || userInterviews.length === 0 ? (
        <div className="flex gap-8 items-center min-h-[500px]">
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                Master Your Next Interview
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Practice with AI-powered mock interviews tailored to your role.
                Get real-time feedback and boost your confidence.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Personalized questions based on job description</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time AI feedback and scoring</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Multiple interview types and difficulty levels</span>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-6">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Start Your First Interview
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Create New Interview
                  </DialogTitle>
                </DialogHeader>
                <InterviewForm onSubmit={onSubmit} isCreating={isCreating} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="hidden lg:block flex-1">
            <SplineModel />
          </div>
        </div>
      ) : (
        <UserInterviews interviews={userInterviews || []} />
      )}
    </div>
  );
};

export default Interview;
