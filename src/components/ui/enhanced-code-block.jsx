'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function CopyButton({ value, className, ...props }) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        'h-8 w-8 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors',
        className
      )}
      onClick={handleCopy}
      title={hasCopied ? 'Copied!' : 'Copy code'}
      {...props}
    >
      {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export function EnhancedCodeBlock({
  children,
  language = 'plaintext',
  className = '',
  showLanguage = true,
  showCopyButton = true,
  ...props
}) {
  // For code blocks, children should be a string of code content
  const codeText =
    typeof children === 'string' ? children : String(children || '');

  // Language display mapping
  const languageMap = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    scala: 'Scala',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    bash: 'Bash',
    shell: 'Shell',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    markdown: 'Markdown',
    makefile: 'Makefile',
    plaintext: 'CODE',
  };

  const displayLanguage = languageMap[language] || language;

  return (
    <div className={cn('group relative my-6', className)} {...props}>
      {/* Header with language and copy button */}
      {(showLanguage || showCopyButton) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg border-b-0">
          {showLanguage && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {displayLanguage}
            </span>
          )}
          {showCopyButton && (
            <CopyButton
              value={codeText}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
      )}

      {/* Code content */}
      <div
        className={cn(
          'relative overflow-x-auto bg-muted/50 border border-border',
          showLanguage || showCopyButton ? 'rounded-b-lg' : 'rounded-lg'
        )}
      >
        <pre className="p-4 text-sm font-mono leading-relaxed text-foreground overflow-x-auto">
          <code className={`language-${language} text-foreground`}>
            {codeText}
          </code>
        </pre>

        {/* Copy button overlay for when header is hidden */}
        {!showLanguage && !showCopyButton && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton value={codeText} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedCodeBlock;
