import { useState } from 'react';
import PreferNav from './PreferNav';
import Split from 'react-split';
import ProblemCodeEditor from './ProblemCodeEditor';
import ProblemTestCases from './ProblemTestCases';

const Playground = ({
  problem,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  onRun,
  runResults,
  isLoading,
  isRunning,
  isSubmitting,
  editorRef,
  onSubmission,
  useBatchMode,
  onBatchModeChange,
  onMaximize,
  editorSettings,
  setEditorSettings,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isTestCasesCollapsed, setIsTestCasesCollapsed] = useState(false);
  // The editorRef is now passed from the parent (Workspace), so we don't create it here.
  // const editorRef = useRef(null);

  // Function to handle maximizing/minimizing the editor
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (onMaximize) {
      onMaximize(!isMaximized);
    }
  };

  // Function to trigger code formatting
  const handleFormatCode = async () => {
    if (editorRef.current && editorRef.current.formatCode) {
      try {
        const success = await editorRef.current.formatCode();
        if (!success) {
          console.warn('Formatting failed, trying Monaco fallback');
          // Fallback to Monaco's built-in formatting
          if (editorRef.current.getAction) {
            const formatAction = editorRef.current.getAction(
              'editor.action.formatDocument'
            );
            if (formatAction) {
              await formatAction.run();
            }
          }
        }
      } catch (error) {
        console.error('Formatting failed:', error);
        // Fallback to Monaco's built-in formatting
        if (editorRef.current.getAction) {
          const formatAction = editorRef.current.getAction(
            'editor.action.formatDocument'
          );
          if (formatAction) {
            await formatAction.run();
          }
        }
      }
    }
  };

  // Playground will contain the PreferNav, CodeEditor, and TestCases
  return (
    <div
      className={`h-full flex flex-col bg-secondary/50 rounded-lg shadow-lg ${isMaximized ? 'fixed left-0 right-0 bottom-0 top-[64px] z-[100]' : ''}`}
    >
      <PreferNav
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        availableLanguages={availableLanguages}
        onFormatCode={handleFormatCode}
        onRun={onRun}
        onSubmit={onSubmission}
        isLoading={isLoading}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
        useBatchMode={useBatchMode}
        onBatchModeChange={onBatchModeChange}
        onMaximize={handleMaximize}
        isMaximized={isMaximized}
        onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
        isCollapsed={isEditorCollapsed}
        editorRef={editorRef}
        editorSettings={editorSettings}
        setEditorSettings={setEditorSettings}
      />
      <Split
        className={
          isMaximized ? 'h-[calc(100vh-84px)]' : 'h-[calc(100vh-114px)]'
        }
        direction="vertical"
        sizes={
          isMaximized
            ? [100, 0]
            : isEditorCollapsed
              ? [0, 100]
              : isTestCasesCollapsed
                ? [95, 5]
                : runResults
                  ? [45, 55]
                  : [60, 40]
        }
        minSize={isMaximized ? [100, 0] : [40, 40]}
        gutterSize={10}
        snapOffset={0}
        gutter={() => {
          const gutter = document.createElement('div');
          gutter.className =
            'relative flex items-center justify-center hover:cursor-row-resize group w-full h-2';

          // Create the visible resize handle with hover effect
          const handle = document.createElement('div');
          handle.className =
            'h-1 w-24 bg-gray-300 group-hover:h-2 group-hover:bg-blue-500 transition-all duration-150 rounded-full';

          gutter.appendChild(handle);
          return gutter;
        }}
      >
        <div className={isEditorCollapsed ? 'h-0 overflow-hidden' : 'h-full'}>
          <ProblemCodeEditor
            problem={problem}
            selectedLanguage={selectedLanguage}
            editorRef={editorRef}
            isLoading={isLoading}
            onLanguageChange={onLanguageChange}
            availableLanguages={availableLanguages}
            editorSettings={editorSettings}
          />
        </div>
        <div className={isMaximized ? 'hidden' : ''}>
          <ProblemTestCases
            problem={problem}
            runResults={runResults}
            onToggleCollapse={() =>
              setIsTestCasesCollapsed(!isTestCasesCollapsed)
            }
            isCollapsed={isTestCasesCollapsed}
          />
        </div>
      </Split>
    </div>
  );
};

export default Playground;
