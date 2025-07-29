import React from 'react';
import {
  ChevronRight,
  SquareCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import ProblemTestResult from './ProblemTestResult';
import { useWorkspaceStore } from '@/store/workspaceStore';

const ProblemTestCases = ({
  problem,
  runResults,
  onToggleCollapse,
  isCollapsed,
}) => {
  const problemId = problem?.id;
  const {
    getSelectedTab,
    setSelectedTab,
    getSelectedTestCase,
    setSelectedTestCase,
  } = useWorkspaceStore();

  const selectedTab = getSelectedTab(problemId);
  const selectedCaseIndex = getSelectedTestCase(problemId);

  React.useEffect(() => {
    if (runResults && problemId) {
      setSelectedTab(problemId, 'test-result');
    }
  }, [runResults, problemId, setSelectedTab]);

  if (!problem) {
    return (
      <div className="text-muted-foreground p-4">Loading test cases...</div>
    );
  }

  const testCases = problem.testCases || [];
  const selectedCase = testCases[selectedCaseIndex];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'testcase':
        return (
          <div className="p-4 space-y-4">
            {/* Test Case Navigation */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                {testCases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTestCase(problemId, index)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCaseIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Case Content */}
            {selectedCase && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Input:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    {selectedCase.input}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Expected Output:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    {selectedCase.output}
                  </div>
                </div>
              </div>
            )}

            {testCases.length === 0 && (
              <div className="text-muted-foreground text-center py-8">
                No test cases available
              </div>
            )}
          </div>
        );
      case 'test-result':
        return (
          <ProblemTestResult
            runResults={runResults}
            problemTestCases={testCases}
            isLoading={false}
            problemId={problemId}
          />
        );
      default:
        return (
          <div className="p-4 space-y-4">
            {/* Test Case Navigation */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                {testCases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTestCase(problemId, index)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCaseIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Case Content */}
            {selectedCase && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Input:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    {selectedCase.input}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Expected Output:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    {selectedCase.output}
                  </div>
                </div>
              </div>
            )}

            {testCases.length === 0 && (
              <div className="text-muted-foreground text-center py-8">
                No test cases available
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex justify-between items-center border-b border-border">
        <div className="flex">
          <button
            onClick={() => setSelectedTab(problemId, 'testcase')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              selectedTab === 'testcase'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SquareCheck className="w-4 h-4" />
            Testcase
          </button>
          <button
            onClick={() => setSelectedTab(problemId, 'test-result')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
              selectedTab === 'test-result'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            Test Result
          </button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-2 hover:bg-accent/50 hover:text-primary"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCollapsed ? 'Expand Test Cases' : 'Collapse Test Cases'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tab Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
      )}
    </div>
  );
};

export default ProblemTestCases;
