'use client';

import * as React from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { EditorKit } from '@/components/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';
import { getTemplateByType } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen } from 'lucide-react';

const initialValue = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function ProblemRichTextEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  minHeight = '200px',
  templateType = null,
}) {
  const [editorValue, setEditorValue] = React.useState(value || initialValue);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: editorValue,
    onChange: newValue => {
      setEditorValue(newValue);
      onChange?.(newValue);
    },
  });

  React.useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(editorValue)) {
      setEditorValue(value);
    }
  }, [value, editorValue]);

  const loadTemplate = () => {
    if (templateType) {
      const template = getTemplateByType(templateType);
      setEditorValue(template);
      onChange?.(template);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden h-full flex flex-col">
      <Plate editor={editor}>
        <div className="flex-shrink-0">
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>
          {templateType && (
            <div className="flex gap-2 p-2 border-b bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={loadTemplate}
                className="flex items-center gap-2"
              >
                {templateType === 'description' ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                Load{' '}
                {templateType === 'description' ? 'Description' : 'Editorial'}{' '}
                Template
              </Button>
            </div>
          )}
        </div>
        <EditorContainer
          variant="select"
          style={{ minHeight, height: '100%', overflowY: 'auto' }}
          className="border-0 flex-1"
        >
          <Editor variant="select" placeholder={placeholder} />
        </EditorContainer>
      </Plate>
    </div>
  );
}
