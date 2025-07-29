'use client';

import * as React from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { EditorKit } from '@/components/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

const initialValue = [{ type: 'p', children: [{ text: '' }] }];

export function CommunityEditor({ onContentChange, wrapToolbar = false }) {
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
        if (onContentChange) {
          onContentChange(newValue);
        }
      }
    };

    const interval = setInterval(handleContentChange, 100);
    return () => clearInterval(interval);
  }, [editor, content, onContentChange]);

  return (
    <div className="h-full flex flex-col min-h-[400px]">
      <Plate editor={editor}>
        <div className="relative">
          <FixedToolbar
            className={`border-b border-amber-200/30 dark:border-amber-500/20 bg-amber-50/50 dark:bg-gray-800/50 overflow-x-auto scrollbar-thin ${wrapToolbar ? '' : 'whitespace-nowrap'}`}
          >
            <FixedToolbarButtons wrapToolbar={wrapToolbar} />
          </FixedToolbar>
          {!wrapToolbar && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent pointer-events-none" />
          )}
        </div>
        <EditorContainer
          variant="select"
          className="flex-1 border-0 bg-transparent"
        >
          <Editor
            variant="select"
            placeholder="Share your thoughts, experiences, or ask questions..."
            className="text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-full p-6 focus:outline-none"
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}
