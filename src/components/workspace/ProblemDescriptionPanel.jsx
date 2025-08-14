import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import {
  Lightbulb,
  FileText,
  BookOpen,
  FlaskConical,
  History,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { CompanyBadgeWithDialog } from '@/components/ui/company-logos-dialog';
import ProblemDiscussion from './ProblemDiscussion';
import ProblemSolution from './ProblemSolution';
import OptimizedProblemSubmission from './OptimizedProblemSubmission';
import ProblemSubmissionResult from './ProblemSubmissionResult';
import ProblemEditorial from './ProblemEditorial';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import SubmissionDetailsModal from './SubmissionDetailsModal';
import NotesEditor from './NotesEditor';
import SketchCanvas from './SketchCanvas';
import { useAuthStore } from '@/store/authStore';

const getDifficultyColor = difficulty => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-500/10 text-green-500';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'hard':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

const ProblemDescriptionPanel = ({
  problem,
  selectedLanguage,
  submissionResult,
  onClearSubmissionResult,
  onSubmissionSelected,
  editorRef,
}) => {
  const [selectedTab, setSelectedTab] = useState('description');
  const [showHints, setShowHints] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedNotesTab, setSelectedNotesTab] = useState('notes');
  const [showAcceptedPanel, setShowAcceptedPanel] = useState(false);
  const hintsRef = useRef(null);
  const { isAuthenticated, isPremium, checkUserSubscription } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      checkUserSubscription();
    }
  }, [isAuthenticated, checkUserSubscription]);

  // Check if problem is solved
  useEffect(() => {
    const checkIfSolved = async () => {
      if (problem?.id) {
        try {
          // TODO: Implement API call to check if problem is solved
          // const response = await submissionAPI.getSolvedByProblemId(problem.id);
          // setIsSolved(response.data.data.length > 0);
          setIsSolved(false);
        } catch (error) {
          console.error('Error checking if problem is solved:', error);
          setIsSolved(false);
        }
      }
    };
    checkIfSolved();
  }, [problem?.id]);

  // Scroll to hints section when showHints becomes true
  useEffect(() => {
    if (showHints && hintsRef.current) {
      hintsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showHints]);

  // Effect to automatically switch to the submission result tab when a new result is available
  useEffect(() => {
    if (
      submissionResult &&
      submissionResult.testCaseResult &&
      submissionResult.testCaseResult.length > 0
    ) {
      setShowAcceptedPanel(true);
      setSelectedTab('submission-result');
    }
  }, [submissionResult]);

  if (!problem) return <Skeleton className="h-full w-full" />;

  const hints = problem.hints || [];
  // Get examples from testCases or examples field
  const getExamplesForLanguage = (problem, selectedLanguage) => {
    // Use testCases as examples if available
    if (problem.testCases && Array.isArray(problem.testCases)) {
      return problem.testCases.map((testCase, index) => ({
        input: testCase.input || '',
        output: testCase.output || testCase.expectedOutput || '',
        explanation: testCase.explanation || `Example ${index + 1}`,
      }));
    }

    // Fallback to examples field
    if (problem.examples) {
      if (Array.isArray(problem.examples)) {
        return problem.examples;
      }
      if (typeof problem.examples === 'object') {
        return (
          problem.examples[selectedLanguage] ||
          problem.examples.JAVASCRIPT ||
          problem.examples[Object.keys(problem.examples)[0]] ||
          []
        );
      }
    }

    return [];
  };

  const examples = getExamplesForLanguage(problem, selectedLanguage);
  const hasMultipleExamples = examples.length > 1;

  // Handle click on hints badge in description tab
  const handleHintsClickInDescription = () => {
    setShowHints(!showHints);
    if (!showHints && hintsRef.current) {
      hintsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to close the submission result tab
  const handleCloseSubmissionResultTab = () => {
    setShowAcceptedPanel(false);
    setSelectedTab('description');
    if (onClearSubmissionResult) onClearSubmissionResult();
  };

  // Function to handle submission selection
  const handleSubmissionSelect = submission => {
    console.log('Submission selected:', submission);
    setSelectedSubmission(submission);
    setIsSubmissionModalOpen(true);
    if (onSubmissionSelected) {
      onSubmissionSelected(submission);
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'description':
        return (
          <SmoothScroll className="p-4 h-full custom-scrollbar">
            {/* Title and Solved Badge */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{problem.title}</h2>
              {isSolved && (
                <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Solved
                </Badge>
              )}
            </div>

            {/* Row 1: Difficulty, Tags, and Hints Badge */}
            <div className="flex items-center gap-4 mb-2">
              <Badge
                className={`capitalize ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </Badge>

              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex gap-1">
                  {problem.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Hints Badge - aligned right */}
              {hints.length > 0 && (
                <Badge
                  variant="secondary"
                  className={`flex items-center gap-1 cursor-pointer ml-auto ${
                    showHints ? 'bg-green-600 text-white' : ''
                  }`}
                  onClick={handleHintsClickInDescription}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Hint{hints.length > 1 ? 's' : ''}</span>
                </Badge>
              )}
            </div>

            {/* Row 2: Companies */}
            {problem.companies && problem.companies.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <CompanyBadgeWithDialog
                  companyIds={problem.companies}
                  maxVisible={6}
                  variant="outline"
                  className="gap-2"
                />
              </div>
            )}

            {/* Problem Image */}
            {problem.imageUrl && (
              <div className="mb-4 flex justify-center">
                <Image
                  src={problem.imageUrl}
                  alt="Problem"
                  className="max-h-64 rounded-lg border"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Description */}
            <div className="prose prose-sm max-w-none dark:prose-invert my-4">
              <ProblemDisplay
                description={problem.description}
                className="max-w-none"
              />
            </div>

            {/* Constraints */}
            {problem.constraints && (
              <div className="mb-4">
                <div className="font-semibold mb-2">Constraints:</div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {typeof problem.constraints === 'string' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: problem.constraints }}
                    />
                  ) : (
                    <ProblemDisplay
                      description={problem.constraints}
                      className="max-w-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Hints Content - conditionally shown below description */}
            {showHints && hints.length > 0 && (
              <div ref={hintsRef} className="space-y-4 mt-4">
                {hints.map((hint, index) => (
                  <div key={index} className="bg-muted/70 rounded-lg p-4">
                    <div className="font-semibold mb-2">Hint {index + 1}:</div>
                    <div className="text-sm whitespace-pre-line">{hint}</div>
                  </div>
                ))}
              </div>
            )}
          </SmoothScroll>
        );

      case 'hints':
        return (
          <SmoothScroll className="p-4 h-full custom-scrollbar">
            {hints.length > 0 ? (
              <div className="space-y-4">
                {hints.map((hint, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4">
                    <div className="font-semibold mb-2">Hint {index + 1}:</div>
                    <div className="text-sm whitespace-pre-line">{hint}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No hints available.</div>
            )}
          </SmoothScroll>
        );
      case 'discussion':
        return (
          <div className="h-full">
            <ProblemDiscussion problem={problem} editorRef={editorRef} />
          </div>
        );
      case 'solution':
        return (
          <SmoothScroll className="p-4 h-full custom-scrollbar">
            {!isAuthenticated() ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-lg font-semibold">
                  🔥 Join DSATrek to Code!
                </div>
                <div className="text-muted-foreground">
                  View solutions codes here
                </div>
                <Button
                  className="mt-4"
                  onClick={() => {
                    const callbackUrl = encodeURIComponent(
                      window.location.href
                    );
                    window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
                  }}
                >
                  Login / Sign Up
                </Button>
              </div>
            ) : !isPremium() ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-lg font-semibold">Premium Feature</div>
                <div className="text-muted-foreground">
                  Subscribe to Pro or Premium plan to access solutions
                </div>
                <div className="text-sm text-muted-foreground">
                  Only Pro and Premium users can access this panel
                </div>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = '/pricing')}
                >
                  Upgrade to Premium
                </Button>
              </div>
            ) : (
              <ProblemSolution
                problem={problem}
                selectedLanguage={selectedLanguage}
              />
            )}
          </SmoothScroll>
        );

      case 'editorial':
        return (
          <SmoothScroll className="p-4 h-full custom-scrollbar">
            <ProblemEditorial problem={problem} />
          </SmoothScroll>
        );
      case 'submissions':
        return (
          <SmoothScroll className="p-4 h-full custom-scrollbar">
            {!isAuthenticated() ? (
              <div className="text-center space-y-4 py-8">
                <div className="text-lg font-semibold">
                  🔥 Join DSATrek to Code!
                </div>
                <div className="text-muted-foreground">
                  View your submission records here
                </div>
                <Button
                  className="mt-4"
                  onClick={() => {
                    const callbackUrl = encodeURIComponent(
                      window.location.href
                    );
                    window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
                  }}
                >
                  Login / Sign Up
                </Button>
              </div>
            ) : (
              <OptimizedProblemSubmission
                problem={problem}
                onSubmissionSelect={handleSubmissionSelect}
              />
            )}
          </SmoothScroll>
        );
      case 'submission-result':
        return (
          showAcceptedPanel &&
          submissionResult && (
            <SmoothScroll className="p-4 h-full custom-scrollbar">
              <ProblemSubmissionResult
                submissionResult={submissionResult}
                problem={problem}
              />
            </SmoothScroll>
          )
        );
      case 'notes':
        return (
          <div className="h-full w-full">
            <Tabs
              value={selectedNotesTab}
              onValueChange={setSelectedNotesTab}
              className="h-full w-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="sketch" className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                  Sketch
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="flex-1 mt-0 h-full">
                <NotesEditor problemId={problem?.id} />
              </TabsContent>

              <TabsContent value="sketch" className="flex-1 mt-0 h-full">
                <SketchCanvas problemId={problem?.id} />
              </TabsContent>
            </Tabs>
          </div>
        );
      default:
        return (
          <SmoothScroll className="p-4 h-full text-muted-foreground custom-scrollbar">
            Select a tab.
          </SmoothScroll>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div className="flex items-center gap-4 border-b border-border px-4 pt-2">
        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
            selectedTab === 'description'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('description')}
        >
          <FileText className="w-4 h-4" />
          Description
        </button>

        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
            selectedTab === 'discussion'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('discussion')}
        >
          <MessageSquare className="w-4 h-4" />
          Discussion
        </button>

        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 relative transition-all duration-200 ${
            selectedTab === 'solution'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('solution')}
        >
          <FlaskConical className="w-4 h-4" />
          Solution
          <span className="text-xs bg-yellow-500 text-black px-1 rounded ml-1">
            PRO
          </span>
        </button>

        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
            selectedTab === 'editorial'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('editorial')}
        >
          <BookOpen className="w-4 h-4" />
          Editorial
        </button>

        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
            selectedTab === 'submissions'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('submissions')}
        >
          <History className="w-4 h-4" />
          Submissions
        </button>

        <button
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
            selectedTab === 'notes'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-foreground hover:text-yellow-400'
          }`}
          onClick={() => setSelectedTab('notes')}
        >
          <FileText className="w-4 h-4" />
          Notes
        </button>

        {/* Conditionally render Submission Result tab if showAcceptedPanel is true */}
        {showAcceptedPanel && (
          <button
            className={`pb-2 text-sm font-medium flex items-center gap-1 ${
              selectedTab === 'submission-result'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
            onClick={() => setSelectedTab('submission-result')}
          >
            <CheckCircle2 className="w-4 h-4" />
            {submissionResult?.status === 'accepted'
              ? 'Accepted'
              : 'Submission Result'}
            <span
              className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                handleCloseSubmissionResultTab();
              }}
            >
              &times;
            </span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden" data-lenis-prevent>
        {renderTabContent()}
      </div>

      {/* Submission Details Modal */}
      <SubmissionDetailsModal
        submission={selectedSubmission}
        open={isSubmissionModalOpen}
        onOpenChange={setIsSubmissionModalOpen}
      />
    </div>
  );
};

export default ProblemDescriptionPanel;
