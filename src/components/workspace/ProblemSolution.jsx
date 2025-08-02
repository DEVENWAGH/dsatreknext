import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const getMonacoLanguage = language => {
  const languageMap = {
    JAVASCRIPT: 'javascript',
    TYPESCRIPT: 'typescript',
    PYTHON: 'python',
    CPP: 'cpp',
    C: 'c',
    JAVA: 'java',
    CSHARP: 'csharp',
    GO: 'go',
    RUST: 'rust',
    KOTLIN: 'kotlin',
    RUBY: 'ruby',
  };
  return languageMap[language] || 'plaintext';
};

const ProblemSolution = ({ problem, selectedLanguage }) => {
  const { resolvedTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState(
    selectedLanguage || 'CPP'
  );
  const [copied, setCopied] = useState(false);
  const [displayCode, setDisplayCode] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);

  React.useEffect(() => {
    if (!problem?.solution) {
      setDisplayCode('');
      setAvailableLanguages([]);
      return;
    }

    try {
      // Handle JSONB data from database
      let solutionData;

      if (typeof problem.solution === 'object') {
        solutionData = problem.solution;
      } else if (typeof problem.solution === 'string') {
        try {
          solutionData = JSON.parse(problem.solution);
        } catch {
          // Fallback to regex parsing if JSON parsing fails
          const langPattern = /"([A-Z_]+)": "([\s\S]*?)(?="[A-Z_]+":|$)/g;
          const matches = [];
          let match;

          while ((match = langPattern.exec(problem.solution)) !== null) {
            if (match[1] && match[2]) {
              const lang = match[1];
              let code = match[2].replace(/\\n/g, '\n');
              code = code.replace(/,\s*"$/, '');
              matches.push({ lang, code });
            }
          }

          solutionData = {};
          matches.forEach(m => {
            solutionData[m.lang] = m.code;
          });
        }
      } else {
        setDisplayCode('');
        setAvailableLanguages([]);
        return;
      }

      // Extract available languages
      const langs = Object.keys(solutionData);
      setAvailableLanguages(langs);

      // Set code for current language or default to first available
      if (solutionData[currentLanguage]) {
        setDisplayCode(solutionData[currentLanguage]);
      } else if (langs.length > 0) {
        setCurrentLanguage(langs[0]);
        setDisplayCode(solutionData[langs[0]]);
      } else {
        setDisplayCode('');
      }
    } catch {
      console.error('Error parsing solution data:');
      setDisplayCode('');
      setAvailableLanguages([]);
    }
  }, [problem?.solution, currentLanguage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  if (!displayCode && availableLanguages.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Solution</h3>
        <div className="text-muted-foreground">No solution available.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Solution</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        {availableLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map(lang => (
              <Button
                key={lang}
                variant={currentLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentLanguage(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden">
        <Editor
          height="75vh"
          language={getMonacoLanguage(currentLanguage)}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          value={displayCode}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};

export default ProblemSolution;
