'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProblemStore } from '@/store/problemStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, MessageSquare, BookOpen } from 'lucide-react';
import ProblemDiscussion from '@/components/community/ProblemDiscussion';

export default function ProblemPage() {
  const params = useParams();
  const { problemId } = params;
  const { currentProblem, getProblemById, isLoading } = useProblemStore();

  useEffect(() => {
    if (problemId) {
      getProblemById(problemId);
    }
  }, [problemId, getProblemById]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Problem not found</h1>
        </div>
      </div>
    );
  }

  const getDifficultyColor = difficulty => {
    switch (difficulty?.toLowerCase()) {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{currentProblem.title}</h1>
          <Badge className={getDifficultyColor(currentProblem.difficulty)}>
            {currentProblem.difficulty}
          </Badge>
        </div>

        {currentProblem.tags && (
          <div className="flex flex-wrap gap-2">
            {currentProblem.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="problem" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="problem" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Problem
          </TabsTrigger>
          <TabsTrigger value="solution" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Solution
          </TabsTrigger>
          <TabsTrigger value="discussion" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Discussion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="problem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    typeof currentProblem.description === 'string'
                      ? currentProblem.description
                      : JSON.stringify(currentProblem.description),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Editorial</CardTitle>
            </CardHeader>
            <CardContent>
              {currentProblem.editorial ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof currentProblem.editorial === 'string'
                        ? currentProblem.editorial
                        : JSON.stringify(currentProblem.editorial),
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  Editorial coming soon...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion" className="space-y-4">
          <ProblemDiscussion problemId={problemId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
