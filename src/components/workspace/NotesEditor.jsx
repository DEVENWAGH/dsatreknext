'use client';
import * as React from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { EditorKit } from '@/components/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

const initialValue = [
  { type: 'p', children: [{ text: 'Start taking notes for this problem...' }] },
];

export default function NotesEditor({ problemId }) {
  const [content, setContent] = React.useState(initialValue);
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: content,
  });

  React.useEffect(() => {
    const handleContentChange = () => {
      const newValue = editor.children;
      if (JSON.stringify(newValue) !== JSON.stringify(content)) {
        setContent(newValue);
        // Save to localStorage
        localStorage.setItem(`notes-${problemId}`, JSON.stringify(newValue));
      }
    };
    const interval = setInterval(handleContentChange, 1000);
    return () => clearInterval(interval);
  }, [editor, content, problemId]);

  // Load saved notes on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`notes-${problemId}`);
      if (saved) {
        const savedContent = JSON.parse(saved);
        setContent(savedContent);
        editor.children = savedContent;
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, [problemId, editor]);

  return (
    <div className="h-full border rounded-lg flex flex-col">
      <Plate editor={editor}>
        <div className="relative">
          <FixedToolbar className="border-b border-amber-200/30 dark:border-amber-500/20 bg-amber-50/50 dark:bg-gray-800/50 overflow-x-auto scrollbar-thin">
            <FixedToolbarButtons wrapToolbar={true} />
          </FixedToolbar>
        </div>
        <EditorContainer
          variant="select"
          className="flex-1 border-0 bg-transparent"
        >
          <Editor
            variant="select"
            placeholder="Start taking notes for this problem..."
            className="text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-full p-6 focus:outline-none"
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}
