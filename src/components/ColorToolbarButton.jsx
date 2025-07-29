'use client';

import * as React from 'react';
import { useEditorRef } from 'platejs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaintBucket } from 'lucide-react';
import { KEYS } from 'platejs';

const COLORS = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#B7B7B7',
  '#CCCCCC',
  '#D9D9D9',
  '#EFEFEF',
  '#F3F3F3',
  '#FFFFFF',
  '#FE0000',
  '#FE9900',
  '#FEFF00',
  '#00FF00',
  '#00FFFF',
  '#4B85E8',
  '#1300FF',
  '#9900FF',
  '#FF00FF',
  '#E6B8AF',
  '#F4CCCC',
  '#FCE4CD',
  '#FFF2CC',
  '#D9EAD3',
];

export function ColorToolbarButton({
  nodeType = KEYS.backgroundColor,
  tooltip = 'Background Color',
}) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const applyColor = color => {
    if (editor?.tf?.addMarks) {
      editor.tf.addMarks({ [nodeType]: color });
      editor.tf.focus();
    }
    setOpen(false);
  };

  const clearColor = () => {
    if (editor?.tf?.removeMarks) {
      editor.tf.removeMarks(nodeType);
      editor.tf.focus();
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={tooltip}
        >
          <PaintBucket className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {COLORS.map(color => (
            <button
              key={color}
              className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => applyColor(color)}
              title={color}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="color"
            className="w-8 h-8 rounded border cursor-pointer"
            onChange={e => applyColor(e.target.value)}
            title="Custom Color"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={clearColor}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
