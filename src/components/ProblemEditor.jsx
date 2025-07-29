'use client';

import * as React from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { EditorKit } from '@/components/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';
import { Button } from '@/components/ui/button';
import { getTemplateByType } from '@/utils/constants';
import { FileText, BookOpen } from 'lucide-react';

const initialValue = [{ type: 'p', children: [{ text: '' }] }];

export function ProblemEditor({
  onDescriptionChange,
  onEditorialChange,
  initialDescription,
  initialEditorial,
}) {
  const [activeTab, setActiveTab] = React.useState('description');
  const [descriptionContent, setDescriptionContent] = React.useState(
    initialDescription || initialValue
  );
  const [editorialContent, setEditorialContent] = React.useState(
    initialEditorial || initialValue
  );

  // Update content when initial props change
  React.useEffect(() => {
    if (initialDescription) {
      setDescriptionContent(initialDescription);
    }
  }, [initialDescription]);

  React.useEffect(() => {
    if (initialEditorial) {
      setEditorialContent(initialEditorial);
    }
  }, [initialEditorial]);

  // Create separate editors for each tab to preserve content
  const descriptionEditor = usePlateEditor({
    plugins: EditorKit,
    value: descriptionContent,
  });

  const editorialEditor = usePlateEditor({
    plugins: EditorKit,
    value: editorialContent,
  });

  // Use editor event listeners to track content changes
  React.useEffect(() => {
    const handleDescriptionChange = () => {
      const newValue = descriptionEditor.children;
      if (JSON.stringify(newValue) !== JSON.stringify(descriptionContent)) {
        console.log(
          'Description content changed:',
          JSON.stringify(newValue, null, 2)
        );
        setDescriptionContent(newValue);
        if (onDescriptionChange) {
          onDescriptionChange(newValue);
        }
      }
    };

    const handleEditorialChange = () => {
      const newValue = editorialEditor.children;
      if (JSON.stringify(newValue) !== JSON.stringify(editorialContent)) {
        console.log(
          'Editorial content changed:',
          JSON.stringify(newValue, null, 2)
        );
        setEditorialContent(newValue);
        if (onEditorialChange) {
          onEditorialChange(newValue);
        }
      }
    };

    // Set up intervals to check for content changes
    const descriptionInterval = setInterval(handleDescriptionChange, 100);
    const editorialInterval = setInterval(handleEditorialChange, 100);

    return () => {
      clearInterval(descriptionInterval);
      clearInterval(editorialInterval);
    };
  }, [
    descriptionEditor,
    editorialEditor,
    descriptionContent,
    editorialContent,
    onDescriptionChange,
    onEditorialChange,
  ]);

  const currentEditor =
    activeTab === 'description' ? descriptionEditor : editorialEditor;
  const setCurrentContent =
    activeTab === 'description' ? setDescriptionContent : setEditorialContent;

  // Initial callback trigger only once
  React.useEffect(() => {
    if (onDescriptionChange && descriptionContent !== initialValue) {
      onDescriptionChange(descriptionContent);
    }
  }, []); // Only run once

  React.useEffect(() => {
    if (onEditorialChange && editorialContent !== initialValue) {
      onEditorialChange(editorialContent);
    }
  }, []); // Only run once

  const loadTemplate = type => {
    const template = getTemplateByType(type);
    console.log(`Loading ${type} template:`, JSON.stringify(template, null, 2));
    setCurrentContent(template);
    currentEditor.tf.setValue(template);

    // Trigger the appropriate callback after loading template
    if (activeTab === 'description' && onDescriptionChange) {
      console.log('Triggering onDescriptionChange with template');
      onDescriptionChange(template);
    } else if (activeTab === 'editorial' && onEditorialChange) {
      console.log('Triggering onEditorialChange with template');
      onEditorialChange(template);
    }
  };

  return (
    <div className="w-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Problem Editor</h2>
      </div>

      <div className="flex border-b mb-2">
        <Button
          variant={activeTab === 'description' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('description')}
          className="rounded-b-none"
        >
          Description
        </Button>
        <Button
          variant={activeTab === 'editorial' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('editorial')}
          className="rounded-b-none"
        >
          Editorial
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden h-full flex flex-col">
        <Plate editor={currentEditor}>
          <FixedToolbar className="overflow-x-auto scrollbar-thin">
            <FixedToolbarButtons />
            <div className="ml-auto flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(activeTab)}
                className="flex items-center gap-2"
              >
                {activeTab === 'description' ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                Load Template
              </Button>
            </div>
          </FixedToolbar>
          <EditorContainer
            variant="select"
            style={{ height: '60vh', overflowY: 'auto' }}
            className="border-0 flex-1"
          >
            <Editor
              variant="select"
              placeholder={`Start typing ${activeTab} content or load template...`}
            />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}
