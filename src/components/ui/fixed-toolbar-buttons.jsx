'use client';

import * as React from 'react';

import {
  ArrowUpToLineIcon,
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorReadOnly } from 'platejs/react';

import { AIToolbarButton } from './ai-toolbar-button';
import { AlignToolbarButton } from './align-toolbar-button';
import { ExportToolbarButton } from './export-toolbar-button';
import { FontColorToolbarButton } from './font-color-toolbar-button';
import { TemplateBackgroundButton } from './template-background-button';
import { FontSizeToolbarButton } from './font-size-toolbar-button';
import { ImportToolbarButton } from './import-toolbar-button';
import {} from './indent-toolbar-button';
import { InsertToolbarButton } from './insert-toolbar-button';
import { LineHeightToolbarButton } from './line-height-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
} from './list-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MediaToolbarButton } from './media-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { TableToolbarButton } from './table-toolbar-button';
import { ToolbarGroup } from './toolbar';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

export function FixedToolbarButtons({ wrapToolbar = false }) {
  const readOnly = useEditorReadOnly();

  return (
    <div className={`flex w-full ${wrapToolbar ? 'flex-wrap' : ''}`}>
      {!readOnly && (
        <>
          {/* Row 1 */}
          <div className="flex w-full justify-between">
            <div className="flex">
              <ToolbarGroup>
                <AIToolbarButton tooltip="AI commands">
                  <WandSparklesIcon />
                </AIToolbarButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <ExportToolbarButton>
                  <ArrowUpToLineIcon />
                </ExportToolbarButton>
                <ImportToolbarButton />
              </ToolbarGroup>

              <ToolbarGroup>
                <InsertToolbarButton />
                <TurnIntoToolbarButton />
                <FontSizeToolbarButton />
              </ToolbarGroup>
            </div>

            <div className="flex">
              <ToolbarGroup>
                <MarkToolbarButton nodeType={KEYS.bold} tooltip="Bold (⌘+B)">
                  <BoldIcon />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType={KEYS.italic}
                  tooltip="Italic (⌘+I)"
                >
                  <ItalicIcon />
                </MarkToolbarButton>
                <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
                  <Code2Icon />
                </MarkToolbarButton>
              </ToolbarGroup>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex w-full justify-between">
            <div className="flex">
              <ToolbarGroup>
                <FontColorToolbarButton
                  nodeType={KEYS.color}
                  tooltip="Text color"
                >
                  <BaselineIcon />
                </FontColorToolbarButton>
                <TemplateBackgroundButton tooltip="Template background color">
                  <PaintBucketIcon className="h-4 w-4" />
                </TemplateBackgroundButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <AlignToolbarButton />
                <NumberedListToolbarButton />
                <BulletedListToolbarButton />
              </ToolbarGroup>
            </div>

            <div className="flex">
              <ToolbarGroup>
                <LinkToolbarButton />
                <TableToolbarButton />
                <MarkToolbarButton
                  nodeType={KEYS.highlight}
                  tooltip="Highlight"
                >
                  <HighlighterIcon />
                </MarkToolbarButton>
              </ToolbarGroup>

              <ToolbarGroup>
                <MediaToolbarButton nodeType={KEYS.img} />
                <MediaToolbarButton nodeType={KEYS.video} />
                <MediaToolbarButton nodeType={KEYS.audio} />
                <MediaToolbarButton nodeType={KEYS.file} />
              </ToolbarGroup>

              <ToolbarGroup>
                <LineHeightToolbarButton />
                <MoreToolbarButton />
              </ToolbarGroup>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
