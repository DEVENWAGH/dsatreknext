import React from 'react';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const EditorSettings = ({ editorRef, settings, updateSettings }) => {
  const handleFontSizeChange = size => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: parseInt(size) });
      updateSettings({ fontSize: parseInt(size) });
    }
  };

  const handleTabSizeChange = size => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ tabSize: parseInt(size) });
      updateSettings({ tabSize: parseInt(size) });
    }
  };

  const handleWordWrapChange = wrap => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: wrap });
      updateSettings({ wordWrap: wrap });
    }
  };

  const handleLineNumbersChange = type => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ lineNumbers: type });
      updateSettings({ lineNumbers: type });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Editor Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Font Size</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.fontSize.toString()}
              onValueChange={handleFontSizeChange}
            >
              {[12, 13, 14, 16, 18].map(size => (
                <DropdownMenuRadioItem key={size} value={size.toString()}>
                  {size}px
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Tab Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Tab Size</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.tabSize.toString()}
              onValueChange={handleTabSizeChange}
            >
              {[2, 4, 8].map(size => (
                <DropdownMenuRadioItem key={size} value={size.toString()}>
                  {size} spaces
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Word Wrap */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Word Wrap</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.wordWrap}
              onValueChange={handleWordWrapChange}
            >
              <DropdownMenuRadioItem value="on">On</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Line Numbers */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Line Numbers</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.lineNumbers}
              onValueChange={handleLineNumbersChange}
            >
              <DropdownMenuRadioItem value="on">On</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="relative">
                Relative
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

EditorSettings.displayName = 'EditorSettings';

export default EditorSettings;
