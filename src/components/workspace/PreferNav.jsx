import React from 'react';
import { Button } from '@/components/ui/button';
import RunButton from '@/components/ui/RunButton';
import SubmitButton from '@/components/ui/SubmitButton';
import {
  Code,
  CodeXml,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import EditorSettings from './EditorSettings';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useLanguageStore } from '@/store/languageStore';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const PreferNav = ({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  onFormatCode,
  onRun,
  onSubmit,
  isLoading,
  isRunning,
  isSubmitting,
  onMaximize,
  isMaximized,
  onToggleCollapse,
  isCollapsed,
  editorRef,
  editorSettings,
  setEditorSettings,
}) => {
  const { getLanguageDisplayName, getLanguageDisplayNameByKey } =
    useLanguageStore();
  const { data: session } = useSession();

  // Helper function to get display name for language
  const getDisplayName = language => {
    // If it's already a proper language key, get its display name
    if (isNaN(language)) {
      return getLanguageDisplayNameByKey(language);
    }

    // If it's a number (old format), get the language key first, then display name
    const languageKey = getLanguageDisplayName(parseInt(language));
    return getLanguageDisplayNameByKey(languageKey);
  };

  return (
    <TooltipProvider>
      <div className="h-10 border-b border-border flex items-center justify-between px-2 text-sm">
        {/* Left Section: Code Title, Icon, and Language Selector */}
        <div className="flex items-center gap-2">
          {/* Code Title and Icon */}
          <div className="flex items-center gap-1">
            <Code className="h-4 w-4 text-green-500" />
            <span className="font-semibold">Code</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 ml-2">
            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-auto bg-transparent border-none h-auto p-2 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages?.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {getDisplayName(lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Section: Format Code Icon and Action Buttons */}
        <div className="flex items-center gap-2 text-muted-foreground">
          {/* Format Code Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-primary"
                onClick={onFormatCode}
              >
                <CodeXml className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Format Code (Shift+Alt+F)</p>
            </TooltipContent>
          </Tooltip>

          {/* Fold/Unfold Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-primary"
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
              <p>{isCollapsed ? 'Expand Editor' : 'Collapse Editor'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Editor Settings */}
          <div id="editor-settings-trigger">
            <EditorSettings
              editorRef={editorRef}
              settings={editorSettings}
              updateSettings={newSettings =>
                setEditorSettings({ ...editorSettings, ...newSettings })
              }
            />
          </div>

          {/* Maximize Icon with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-primary"
                onClick={onMaximize}
              >
                {isMaximized ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMaximized ? 'Exit Fullscreen' : 'Fullscreen Editor'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Run Button */}
          <RunButton
            onClick={() => {
              if (!session?.user) {
                toast.error('You need to log in / sign up to run or submit');
                return;
              }
              onRun();
            }}
            disabled={isRunning}
            isLoading={isRunning}
          >
            Run
          </RunButton>

          {/* Submit Button */}
          <SubmitButton
            onClick={() => {
              if (!session?.user) {
                toast.error('You need to log in / sign up to run or submit');
                return;
              }
              onSubmit();
            }}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Submit
          </SubmitButton>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PreferNav;
