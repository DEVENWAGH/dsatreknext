'use client';

import * as React from 'react';
import { useEditorRef } from 'platejs/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { ColorToolbarButton } from '@/components/ColorToolbarButton';

export function SimplifiedToolbar() {
  const editor = useEditorRef();

  const toggleMark = mark => {
    if (editor?.tf?.toggle?.mark) {
      editor.tf.toggle.mark({ key: mark });
    }
  };

  const setBlockType = type => {
    if (editor?.tf?.setNodes) {
      editor.tf.setNodes({ type });
    }
  };

  const insertList = type => {
    if (editor?.tf?.toggle?.list) {
      editor.tf.toggle.list({ type });
    }
  };

  const undo = () => {
    if (editor?.tf?.undo) {
      editor.tf.undo();
    }
  };

  const redo = () => {
    if (editor?.tf?.redo) {
      editor.tf.redo();
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
      {/* History */}
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        className="h-8 w-8 p-0"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        className="h-8 w-8 p-0"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark(KEYS.bold)}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark(KEYS.italic)}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark(KEYS.underline)}
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark(KEYS.code)}
        className="h-8 w-8 p-0"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h1')}
        className="h-8 w-8 p-0"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h2')}
        className="h-8 w-8 p-0"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h3')}
        className="h-8 w-8 p-0"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertList('ul')}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertList('ol')}
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Elements */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('blockquote')}
        className="h-8 w-8 p-0"
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Colors */}
      <ColorToolbarButton
        nodeType={KEYS.backgroundColor}
        tooltip="Background Color"
      />
      <ColorToolbarButton nodeType={KEYS.color} tooltip="Text Color" />
    </div>
  );
}
