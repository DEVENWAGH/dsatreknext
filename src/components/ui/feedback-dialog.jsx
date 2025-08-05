'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Star, Clock, User, CheckCircle } from 'lucide-react';

export function FeedbackDialog({ interview, trigger }) {
  const [open, setOpen] = useState(false);

  if (!interview?.feedback) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              No Feedback Available
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              No feedback is available for this interview yet.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Complete the interview to receive AI-generated feedback.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            View Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Interview Feedback
          </DialogTitle>
          <DialogDescription>
            AI-generated feedback for your {interview.position} interview
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Interview Summary */}
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Position</p>
                    <p className="text-muted-foreground">
                      {interview.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">
                      {interview.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Difficulty</p>
                    <Badge variant="secondary" className="capitalize">
                      {interview.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-muted-foreground">
                      {interview.interviewType}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feedback Content */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Detailed Feedback
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {interview.feedback}
                </div>
              </div>
            </Card>

            {/* Interview Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      interview.status === 'completed' ? 'default' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {interview.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {interview.status === 'completed'
                      ? 'Interview Completed'
                      : 'In Progress'}
                  </span>
                </div>
                {interview.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {interview.rating}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
