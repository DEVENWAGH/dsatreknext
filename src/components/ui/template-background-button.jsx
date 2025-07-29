'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from './toolbar';
import {
  ColorDropdownMenuItems,
  DEFAULT_COLORS,
} from './font-color-toolbar-button';

export function TemplateBackgroundButton({ children, tooltip }) {
  const [open, setOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState('#ffffff');

  const updateTemplateBackground = React.useCallback(color => {
    // Apply background color to the editor container
    const editorContainer = document.querySelector(
      '[data-slate-editor="true"]'
    );
    if (editorContainer) {
      editorContainer.style.backgroundColor = color;
    }
    setSelectedColor(color);
    setOpen(false);
  }, []);

  const clearBackground = React.useCallback(() => {
    const editorContainer = document.querySelector(
      '[data-slate-editor="true"]'
    );
    if (editorContainer) {
      editorContainer.style.backgroundColor = '';
    }
    setSelectedColor('#ffffff');
    setOpen(false);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={tooltip}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="flex flex-col">
          <div className="px-2 py-1 text-sm font-medium">
            Template Background
          </div>
          <ColorDropdownMenuItems
            color={selectedColor}
            colors={DEFAULT_COLORS}
            updateColor={updateTemplateBackground}
            className="px-2"
          />
          <button
            onClick={clearBackground}
            className="mx-2 my-1 px-2 py-1 text-sm hover:bg-gray-100 rounded"
          >
            Clear Background
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
