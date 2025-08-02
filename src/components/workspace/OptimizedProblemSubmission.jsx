import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MemoryStick, Eye } from 'lucide-react';
import { getStatusColor } from './ProblemTestResult';
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/store/languageStore';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const OptimizedProblemSubmission = ({ problem, onSubmissionSelect }) => {
  const { getLanguageDisplayName } = useLanguageStore();
  const { data: session } = useSession();
  const {
    data: submissions = [],
    isLoading,
    error,
  } = useSubmissions(problem?.id);

  const isAuthenticated = () => !!session?.user;

  const formatRuntime = timeStr => {
    if (!timeStr) return '';
    try {
      const timeArray = JSON.parse(timeStr);
      if (Array.isArray(timeArray) && timeArray.length > 0) {
        const timeMs = parseFloat(timeArray[0]);
        if (timeMs < 1000) {
          return `${timeMs.toFixed(2)} ms`;
        } else {
          return `${(timeMs / 1000).toFixed(2)} s`;
        }
      }
    } catch {
      return timeStr;
    }
    return '';
  };

  const formatMemory = memoryStr => {
    if (!memoryStr) return '';
    try {
      const memoryArray = JSON.parse(memoryStr);
      if (Array.isArray(memoryArray) && memoryArray.length > 0) {
        const memoryKB = parseFloat(memoryArray[0]);
        if (memoryKB >= 1024) {
          return `${(memoryKB / 1024).toFixed(2)} MB`;
        } else {
          return `${memoryKB.toFixed(2)} KB`;
        }
      }
    } catch {
      return memoryStr;
    }
    return '';
  };

  if (!problem) {
    return (
      <div className="p-4 text-muted-foreground">
        Loading problem details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">Error loading submissions: {error}</div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Separate accepted and other submissions
  const acceptedSubmissions = submissions.filter(s => s.status === 'accepted');
  const otherSubmissions = submissions.filter(s => s.status !== 'accepted');
  const allSubmissions = [...acceptedSubmissions, ...otherSubmissions];

  if (!session?.user) {
    return (
      <div className="p-4 text-center space-y-2">
        <div className="text-lg font-semibold">🔥 Join DSATrek to Code!</div>
        <Button
          className="mt-4"
          onClick={() => {
            const callbackUrl = encodeURIComponent(window.location.href);
            window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
          }}
        >
          Login / Sign Up
        </Button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground flex flex-col items-center">
        <Image
          src="/Null.png"
          alt="No submissions"
          width={160}
          height={160}
          style={{ width: 'auto', height: 'auto' }}
          className="mt-60 mb-2 max-w-[160px] max-h-[160px]"
        />
        No submissions yet. Submit your solution to see it here.
      </div>
    );
  }

  const getStatusDisplay = status => {
    switch (status) {
      case 'accepted':
        return 'Correct';
      case 'wrong_answer':
        return 'Wrong Answer';
      case 'time_limit_exceeded':
        return 'Time Limit Exceeded';
      case 'memory_limit_exceeded':
        return 'Memory Limit Exceeded';
      case 'runtime_error':
        return 'Runtime Error';
      case 'compilation_error':
        return 'Compilation Error';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getLanguageDisplay = language => {
    const langMap = {
      JAVASCRIPT: 'javascript (node.js 12.14.0)',
      JAVASCRIPT_12: 'javascript (node.js 12.14.0)',
      JAVASCRIPT_18: 'javascript (node.js 18.15.0)',
      JAVASCRIPT_20: 'javascript (node.js 20.17.0)',
      CPP: 'C++ (GCC 9.2.0)',
      CPP_GCC_14: 'C++ (GCC 14.1.0)',
      C: 'C (GCC 9.2.0)',
      JAVA: 'java (openjdk 13.0.1)',
      CSHARP: 'C# (Mono 6.6.0.161)',
      PYTHON: 'python (3.8.1)',
      PYTHON_11: 'python (3.11.2)',
      PYTHON_12: 'python (3.12.0)',
      TYPESCRIPT: 'typescript (3.7.4)',
      GO: 'go (1.13.5)',
      RUST: 'rust (1.40.0)',
      RUBY: 'ruby (2.7.0)',
    };
    return langMap[language] || language?.toLowerCase() || 'Unknown';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Accepted Submissions Section */}
      {acceptedSubmissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Accepted ({acceptedSubmissions.length})
          </h3>
          <div className="space-y-2">
            {acceptedSubmissions.map(submission => (
              <div
                key={submission.id}
                className="border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800 rounded-lg p-3 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-950/30 transition-colors"
                onClick={() => onSubmissionSelect(submission)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Accepted
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getLanguageDisplay(submission.language)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(submission.createdAt))} ago
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {submission.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRuntime(submission.runtime)}
                    </div>
                  )}
                  {submission.memory && (
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3" />
                      {formatMemory(submission.memory)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Submissions ({submissions.length})
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time (IST)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSubmissions.map(submission => (
                <TableRow
                  key={submission.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSubmissionSelect(submission)}
                >
                  <TableCell className="text-sm">
                    {format(
                      new Date(submission.createdAt),
                      'dd/MM/yyyy, HH:mm:ss'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusDisplay(submission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getLanguageDisplayName(submission.language) ||
                      getLanguageDisplay(submission.language)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onSubmissionSelect(submission);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OptimizedProblemSubmission;
