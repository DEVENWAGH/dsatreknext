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
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

export function ProblemEditorToolbar() {
  const editor = useEditorRef();

  const toggleMark = mark => {
    try {
      editor.tf.toggle.mark({ key: mark });
    } catch {
      console.log('Toggle mark not available:', mark);
    }
  };

  const setBlockType = type => {
    try {
      editor.tf.setNodes({ type });
    } catch {
      console.log('Set block type not available:', type);
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark('bold')}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark('italic')}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark('underline')}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMark('code')}
        className="h-8 w-8 p-0"
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
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h2')}
        className="h-8 w-8 p-0"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('h3')}
        className="h-8 w-8 p-0"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Elements */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBlockType('blockquote')}
        className="h-8 w-8 p-0"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  );
}
