import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import {
  Copy,
  Clock,
  MemoryStick,
  CheckCircle,
  XCircle,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLanguageStore } from '@/store/languageStore';

const SubmissionDetailsModal = ({ submission, open, onOpenChange }) => {
  const { getLanguageDisplayName } = useLanguageStore();

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wrong_answer':
      case 'wrong answer':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'time_limit_exceeded':
      case 'time limit exceeded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'memory_limit_exceeded':
      case 'memory limit exceeded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'runtime_error':
      case 'runtime error':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'compilation_error':
      case 'compilation error':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplay = status => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRuntime = timeStr => {
    if (!timeStr) return 'N/A';
    try {
      // Handle both string and numeric values
      if (typeof timeStr === 'string') {
        // If it's a JSON array, parse it
        if (timeStr.startsWith('[')) {
          const timeArray = JSON.parse(timeStr);
          if (Array.isArray(timeArray) && timeArray.length > 0) {
            const timeMs = parseFloat(timeArray[0]);
            return timeMs < 1000
              ? `${timeMs.toFixed(2)} ms`
              : `${(timeMs / 1000).toFixed(2)} s`;
          }
        }
        // If it's already a formatted string, return as is
        if (timeStr.includes('ms') || timeStr.includes('s')) {
          return timeStr;
        }
        // Otherwise, treat as numeric string
        const timeNum = parseFloat(timeStr);
        return timeNum < 1
          ? `${(timeNum * 1000).toFixed(2)} ms`
          : `${timeNum.toFixed(3)} s`;
      }
      // Handle numeric values
      const timeNum = parseFloat(timeStr);
      return timeNum < 1
        ? `${(timeNum * 1000).toFixed(2)} ms`
        : `${timeNum.toFixed(3)} s`;
    } catch {
      return timeStr || 'N/A';
    }
  };

  const formatMemory = memoryStr => {
    if (!memoryStr) return 'N/A';
    try {
      // Handle both string and numeric values
      if (typeof memoryStr === 'string') {
        // If it's a JSON array, parse it
        if (memoryStr.startsWith('[')) {
          const memoryArray = JSON.parse(memoryStr);
          if (Array.isArray(memoryArray) && memoryArray.length > 0) {
            const memoryKB = parseFloat(memoryArray[0]);
            return memoryKB >= 1024
              ? `${(memoryKB / 1024).toFixed(2)} MB`
              : `${memoryKB.toFixed(2)} KB`;
          }
        }
        // If it's already formatted, return as is
        if (memoryStr.includes('KB') || memoryStr.includes('MB')) {
          return memoryStr;
        }
        // Otherwise, treat as numeric string (assume KB)
        const memoryNum = parseFloat(memoryStr);
        return memoryNum >= 1024
          ? `${(memoryNum / 1024).toFixed(2)} MB`
          : `${memoryNum.toFixed(2)} KB`;
      }
      // Handle numeric values (assume KB)
      const memoryNum = parseFloat(memoryStr);
      return memoryNum >= 1024
        ? `${(memoryNum / 1024).toFixed(2)} MB`
        : `${memoryNum.toFixed(2)} KB`;
    } catch {
      return memoryStr || 'N/A';
    }
  };

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Code copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Code copied to clipboard!');
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Submission Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden w-full">
          <SmoothScroll className="h-full w-full">
            <div className="space-y-6 w-full">
              {/* Submission Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status?.toLowerCase() === 'accepted' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {getStatusDisplay(submission.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Language</div>
                  <div className="font-medium">
                    {getLanguageDisplayName(submission.language) ||
                      submission.language}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Runtime
                  </div>
                  <div className="font-medium">
                    {formatRuntime(submission.runtime)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MemoryStick className="w-3 h-3" />
                    Memory
                  </div>
                  <div className="font-medium">
                    {formatMemory(submission.memory)}
                  </div>
                </div>
              </div>

              {/* Test Cases Results */}
              {submission.testCasesPassed && submission.totalTestCases && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Test Cases
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {submission.testCasesPassed}/{submission.totalTestCases}{' '}
                      Passed
                    </Badge>
                    {submission.testCasesPassed ===
                    submission.totalTestCases ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              )}

              {/* Submission Time */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Submitted At
                </div>
                <div className="font-medium">
                  {format(
                    new Date(submission.createdAt),
                    'dd/MM/yyyy, HH:mm:ss'
                  )}{' '}
                  IST
                </div>
              </div>

              <Separator />

              {/* Code Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Submitted Code</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(submission.code)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                </div>

                <div className="relative">
                  <SmoothScroll className="h-auto max-h-96 w-full border rounded-lg overflow-y-auto overflow-x-hidden">
                    <pre className="bg-muted/50 p-4 text-sm whitespace-pre-wrap break-words">
                      <code
                        className={`language-${submission.language?.toLowerCase() || 'javascript'} whitespace-pre-wrap break-words`}
                      >
                        {submission.code}
                      </code>
                    </pre>
                  </SmoothScroll>
                </div>
              </div>

              {/* Test Case Details (if available) */}
              {submission.testCaseResult && (
                <div className="space-y-3">
                  <Separator />
                  <h3 className="text-lg font-semibold">Test Case Results</h3>
                  <div className="space-y-3">
                    {submission.testCaseResult.map((testCase, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Test Case {index + 1}
                          </span>
                          <Badge
                            className={
                              testCase.passed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {testCase.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>

                        <div className="grid gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Input:{' '}
                            </span>
                            <code className="bg-muted px-1 rounded">
                              {testCase.input || 'N/A'}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Expected:{' '}
                            </span>
                            <code className="bg-muted px-1 rounded">
                              {testCase.expectedOutput || 'N/A'}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Actual:{' '}
                            </span>
                            <code className="bg-muted px-1 rounded">
                              {testCase.actualOutput || 'N/A'}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SmoothScroll>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailsModal;
