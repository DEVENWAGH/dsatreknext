import React, { useState, useEffect, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from '@/components/ui/theme-provider';
import { useLanguageStore } from '@/store/languageStore';
import { useSession } from 'next-auth/react';
import { CollaborativeEditor } from './CollaborativeEditor';

import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserTypescript from 'prettier/parser-typescript';
import {
  formatPython,
  formatCpp,
  formatJava,
  formatGo,
  formatRust,
  formatRuby,
  formatCsharp,
} from '@/utils/codeFormatter';

const getMonacoLanguage = displayName => {
  const languageMap = {
    JAVASCRIPT: 'javascript',
    JAVASCRIPT_12: 'javascript',
    JAVASCRIPT_18: 'javascript',
    JAVASCRIPT_20: 'javascript',
    TYPESCRIPT: 'typescript',
    TYPESCRIPT_3: 'typescript',
    TYPESCRIPT_5: 'typescript',
    PYTHON: 'python',
    PYTHON_2: 'python',
    PYTHON_11: 'python',
    PYTHON_12: 'python',
    PYTHON_13: 'python',
    CPP: 'cpp',
    CPP_CLANG: 'cpp',
    CPP_GCC_7: 'cpp',
    CPP_GCC_8: 'cpp',
    CPP_GCC_14: 'cpp',
    C: 'c',
    C_CLANG: 'c',
    C_CLANG_7: 'c',
    C_CLANG_19: 'c',
    C_GCC_7: 'c',
    C_GCC_8: 'c',
    C_GCC_14: 'c',
    CSHARP: 'csharp',
    JAVA: 'java',
    JAVA_17: 'java',
    JAVAFX: 'java',
    GO: 'go',
    GO_13: 'go',
    GO_18: 'go',
    GO_22: 'go',
    RUST: 'rust',
    RUST_40: 'rust',
    PHP: 'php',
    PHP_7: 'php',
    RUBY: 'ruby',
    KOTLIN: 'kotlin',
    KOTLIN_13: 'kotlin',
    SWIFT: 'swift',
    SCALA: 'scala',
    R: 'r',
    R_4: 'r',
    LUA: 'lua',
    PERL: 'perl',
    BASH: 'shell',
    SQL: 'sql',
    HASKELL: 'haskell',
    CLOJURE: 'clojure',
    DART: 'dart',
    ELIXIR: 'elixir',
    ERLANG: 'erlang',
    FSHARP: 'fsharp',
    VB_NET: 'vb',
    PASCAL: 'pascal',
    FORTRAN: 'fortran',
    COBOL: 'cobol',
    ASSEMBLY: 'assembly',
    LISP: 'lisp',
    PROLOG: 'prolog',
    D: 'd',
    OCAML: 'ocaml',
    GROOVY: 'groovy',
    OBJECTIVE_C: 'objective-c',
  };

  return languageMap[displayName] || 'plaintext';
};

// Prettier formatting with fallback to Monaco
const formatCodeWithPrettier = async (editor, language) => {
  if (!editor) return false;

  try {
    const model = editor.getModel();
    if (!model) return false;

    const code = model.getValue();
    if (!code.trim()) return false;

    const monacoLanguage = getMonacoLanguage(language);
    let formattedCode;

    // Try Prettier first for supported languages
    try {
      const prettierOptions = {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 80,
        plugins: [parserBabel, parserTypescript],
      };

      switch (monacoLanguage) {
        case 'javascript':
          formattedCode = prettier.format(code, {
            ...prettierOptions,
            parser: 'babel',
            plugins: [parserBabel],
          });
          break;
        case 'typescript':
          formattedCode = prettier.format(code, {
            ...prettierOptions,
            parser: 'typescript',
            plugins: [parserTypescript],
          });
          break;
        case 'java':
          formattedCode = formatJava(code);
          break;
        case 'python':
          formattedCode = formatPython(code);
          break;
        case 'cpp':
        case 'c':
          formattedCode = formatCpp(code);
          break;
        case 'go':
          formattedCode = formatGo(code);
          break;
        case 'rust':
          formattedCode = formatRust(code);
          break;
        case 'ruby':
          formattedCode = formatRuby(code);
          break;
        case 'csharp':
          formattedCode = formatCsharp(code);
          break;
        default:
          // Fallback to Monaco's formatter
          return await formatCodeWithMonaco(editor, language);
      }

      if (formattedCode && formattedCode !== code) {
        model.setValue(formattedCode);
        console.log(`Formatted ${language} code using Prettier`);
        return true;
      }
    } catch (prettierError) {
      console.log(
        `Prettier failed for ${language}, falling back to Monaco:`,
        prettierError.message
      );
      return await formatCodeWithMonaco(editor, language);
    }

    return false;
  } catch (error) {
    console.error('Formatting error:', error);
    return false;
  }
};

// Monaco fallback formatter
const formatCodeWithMonaco = async (editor, language) => {
  if (!editor) return false;

  try {
    const formatAction = editor.getAction('editor.action.formatDocument');
    if (formatAction) {
      await formatAction.run();
      console.log(`Formatted ${language} code using Monaco's formatter`);
      return true;
    }

    const formatSelectionAction = editor.getAction(
      'editor.action.formatSelection'
    );
    if (formatSelectionAction) {
      const model = editor.getModel();
      const fullRange = model.getFullModelRange();
      editor.setSelection(fullRange);
      await formatSelectionAction.run();
      console.log(
        `Formatted ${language} code using Monaco's selection formatter`
      );
      return true;
    }

    console.warn(`No formatter available for language: ${language}`);
    return false;
  } catch (error) {
    console.error('Monaco formatting error:', error);
    return false;
  }
};

// Accept props
const ProblemCodeEditor = ({
  problem,
  selectedLanguage,
  editorRef,
  // isLoading,
  // onLanguageChange,
  // availableLanguages,
  editorSettings,
}) => {
  const [code, setCode] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  // const [isFormattingCode, setIsFormattingCode] = useState(false);
  const [formatStatus, setFormatStatus] = useState(null);
  const [mounted, setMounted] = useState(false);
  // const [isFullscreen, setIsFullscreen] = useState(false);
  // const editorContainerRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  const { getLanguageIdByDisplayName } = useLanguageStore();

  // Helper function to get starter code for the selected language
  const getStarterCodeForLanguage = React.useCallback(
    (problem, selectedLanguage) => {
      if (!problem?.starterCode) return '';

      // Try to get code using language key first (new format)
      let code = problem.starterCode[selectedLanguage];
      if (code) return code;

      // If not found, try using language ID (old format - backward compatibility)
      const languageId = getLanguageIdByDisplayName(selectedLanguage);
      if (languageId) {
        code = problem.starterCode[languageId.toString()];
        if (code) return code;
      }

      return '';
    },
    [getLanguageIdByDisplayName]
  );

  // Memoize the starter code to prevent unnecessary recalculations
  const starterCode = useMemo(() => {
    return getStarterCodeForLanguage(problem, selectedLanguage);
  }, [problem, selectedLanguage, getStarterCodeForLanguage]);

  useEffect(() => {
    setCode(starterCode);

    // Always update editor if it's ready
    if (isEditorReady && editorRef.current) {
      editorRef.current.setValue(starterCode);
    }
  }, [starterCode, isEditorReady, editorRef]);

  const handleEditorDidMount = React.useCallback(
    (editor, monaco) => {
      // Store monaco instance globally for theme management
      window.monacoInstance = monaco;

      // Assign the editor instance to the ref
      editorRef.current = editor;
      setIsEditorReady(true);

      // Set initial value after mount
      editorRef.current.setValue(starterCode);

      // Register additional language features for better formatting
      try {
        // Enhanced language configuration for better formatting
        const languages = [
          'javascript',
          'typescript',
          'java',
          'python',
          'cpp',
          'c',
          'csharp',
          'go',
          'rust',
          'ruby',
        ];

        languages.forEach(lang => {
          try {
            monaco.languages.setLanguageConfiguration(lang, {
              brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
              ],
              autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
              ],
              surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" },
              ],
              indentationRules: {
                increaseIndentPattern: /^.*\{[^}"']*$/,
                decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
              },
            });
          } catch (langError) {
            console.log(
              `Language ${lang} configuration already exists or failed:`,
              langError.message
            );
          }
        });
      } catch (error) {
        console.log(
          'Language configuration setup completed with some warnings:',
          error
        );
      }

      if (mounted) {
        const currentTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(currentTheme);
      }

      // Add format code command with Shift+Alt+F shortcut
      editorRef.current.addAction({
        id: 'format-code',
        label: 'Format Code',
        keybindings: [
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        ],
        contextMenuGroupId: '1_modification',
        run: async () => {
          const success = await formatCodeWithPrettier(
            editor,
            selectedLanguage
          );
          if (success) {
            setFormatStatus({
              type: 'success',
              message: 'Code formatted successfully!',
            });
          } else {
            setFormatStatus({
              type: 'warning',
              message: `No formatter available for ${selectedLanguage}`,
            });
          }
          setTimeout(() => setFormatStatus(null), 3000);
        },
      });

      // Add context menu formatting option
      editorRef.current.addAction({
        id: 'format-code-context',
        label: 'Format Document',
        contextMenuGroupId: '1_modification',
        contextMenuOrder: 1,
        run: async () => {
          const success = await formatCodeWithPrettier(
            editor,
            selectedLanguage
          );
          if (success) {
            setFormatStatus({
              type: 'success',
              message: 'Code formatted successfully!',
            });
          } else {
            setFormatStatus({
              type: 'warning',
              message: `No formatter available for ${selectedLanguage}`,
            });
          }
          setTimeout(() => setFormatStatus(null), 3000);
        },
      });

      // Add additional helpful actions
      editorRef.current.addAction({
        id: 'toggle-word-wrap',
        label: 'Toggle Word Wrap',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        contextMenuGroupId: '9_cutcopypaste',
        run: () => {
          const currentWrap = editor.getOption(
            monaco.editor.EditorOption.wordWrap
          );
          const newWrap = currentWrap === 'on' ? 'off' : 'on';
          editor.updateOptions({ wordWrap: newWrap });
          console.log(`Word wrap ${newWrap === 'on' ? 'enabled' : 'disabled'}`);
        },
      });

      // Add fold/unfold actions
      editorRef.current.addAction({
        id: 'fold-all',
        label: 'Fold All',
        keybindings: [
          monaco.KeyMod.CtrlCmd |
            monaco.KeyMod.Shift |
            monaco.KeyCode.BracketLeft,
        ],
        contextMenuGroupId: '9_folding',
        run: () => {
          editor.getAction('editor.foldAll')?.run();
        },
      });

      editorRef.current.addAction({
        id: 'unfold-all',
        label: 'Unfold All',
        keybindings: [
          monaco.KeyMod.CtrlCmd |
            monaco.KeyMod.Shift |
            monaco.KeyCode.BracketRight,
        ],
        contextMenuGroupId: '9_folding',
        run: () => {
          editor.getAction('editor.unfoldAll')?.run();
        },
      });

      // Toggle line numbers
      editorRef.current.addAction({
        id: 'toggle-line-numbers',
        label: 'Toggle Line Numbers',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyL],
        contextMenuGroupId: '9_view',
        run: () => {
          const currentLineNumbers = editor.getOption(
            monaco.editor.EditorOption.lineNumbers
          );
          const newLineNumbers =
            currentLineNumbers === 'on'
              ? 'off'
              : currentLineNumbers === 'off'
                ? 'relative'
                : 'on';
          editor.updateOptions({ lineNumbers: newLineNumbers });
        },
      });
    },
    [mounted, resolvedTheme, starterCode]
  );

  const formatCurrentCode = React.useCallback(async () => {
    if (!editorRef.current || !isEditorReady) return;

    // setIsFormattingCode(true);
    setFormatStatus(null);

    try {
      const success = await formatCodeWithPrettier(
        editorRef.current,
        selectedLanguage
      );

      if (success) {
        setFormatStatus({
          type: 'success',
          message: 'Code formatted successfully!',
        });
      } else {
        setFormatStatus({
          type: 'warning',
          message: `No formatter available for ${selectedLanguage}`,
        });
      }
    } catch (error) {
      console.error('Error formatting code:', error);
      setFormatStatus({ type: 'error', message: 'Failed to format code' });
    } finally {
      // setIsFormattingCode(false);
      // Clear status after 3 seconds
      setTimeout(() => setFormatStatus(null), 3000);
    }
  }, [selectedLanguage, isEditorReady]);

  useEffect(() => {
    if (mounted && isEditorReady && window.monacoInstance) {
      const currentTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';
      window.monacoInstance.editor.setTheme(currentTheme);
    }
  }, [mounted, resolvedTheme, isEditorReady]);

  // Expose format function to parent via ref
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.formatCode = async () => {
        return await formatCodeWithPrettier(
          editorRef.current,
          selectedLanguage
        );
      };
    }
  }, [isEditorReady, selectedLanguage, editorRef]);

  // Determine the language for the editor
  const editorLanguage = getMonacoLanguage(selectedLanguage);

  const { data: session } = useSession();

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar - Only show format status when active */}
      {formatStatus && (
        <div className="flex items-center justify-end p-2 border-b bg-background">
          <span
            className={`text-xs px-2 py-1 rounded ${
              formatStatus.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : formatStatus.type === 'warning'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {formatStatus.message}
          </span>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <EditorComponent
          editorLanguage={editorLanguage}
          mounted={mounted}
          resolvedTheme={resolvedTheme}
          code={code}
          setCode={setCode}
          handleEditorDidMount={handleEditorDidMount}
          editorSettings={editorSettings}
        />
      </div>

      {/* Login Prompt */}
      {!session?.user && (
        <div className="p-3 bg-muted/50 border-t text-center text-sm text-muted-foreground">
          You need to{' '}
          <a
            href={`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`}
            className="text-blue-600 hover:underline font-semibold"
          >
            log in
          </a>{' '}
          or{' '}
          <a
            href={`/auth/signup?callbackUrl=${encodeURIComponent(window.location.href)}`}
            className="text-blue-600 hover:underline font-semibold"
          >
            sign up
          </a>{' '}
          to run or submit
        </div>
      )}
    </div>
  );
};

// Separate component to handle collaboration check
const EditorComponent = ({
  editorLanguage,
  mounted,
  resolvedTheme,
  code,
  setCode,
  handleEditorDidMount,
  editorSettings,
}) => {
  const [isCollaborative, setIsCollaborative] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsCollaborative(searchParams.has('roomId'));
    }
  }, []);

  if (mounted && isCollaborative) {
    return (
      <CollaborativeEditor
        language={editorLanguage}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
        defaultValue={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: editorSettings?.fontSize || 13,
          lineNumbers: editorSettings?.lineNumbers || 'on',
          wordWrap: editorSettings?.wordWrap || 'on',
          tabSize: editorSettings?.tabSize || 4,
        }}
      />
    );
  }

  return (
    <Editor
      height="100%"
      language={editorLanguage}
      theme={mounted && resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
      value={code}
      onChange={setCode}
      onMount={handleEditorDidMount}
      beforeMount={monaco => {
        window.monacoInstance = monaco;
        if (mounted) {
          const currentTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';
          monaco.editor.setTheme(currentTheme);
        }
      }}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        fontSize: editorSettings?.fontSize || 13,
        lineNumbers: editorSettings?.lineNumbers || 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        domReadOnly: false,
        cursorStyle: 'line',
        wordWrap: editorSettings?.wordWrap || 'on',
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        matchBrackets: 'always',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        insertSpaces: true,
        tabSize: editorSettings?.tabSize || 4,
        bracketPairColorization: { enabled: true },
      }}
    />
  );
};

export default ProblemCodeEditor;
