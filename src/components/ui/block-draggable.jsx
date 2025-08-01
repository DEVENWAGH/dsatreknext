'use client';

import * as React from 'react';

import { DndPlugin, useDraggable, useDropLine } from '@platejs/dnd';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { GripVertical } from 'lucide-react';
import { getPluginByType, isType, KEYS } from 'platejs';
import {
  MemoizedChildren,
  useEditorRef,
  useElement,
  usePluginOption,
} from 'platejs/react';
import { useSelected } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td];

export const BlockDraggable = props => {
  const { editor, element, path } = props;

  const enabled = React.useMemo(() => {
    if (editor.dom.readOnly) return false;

    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.column),
        },
      });

      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.table),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path]);

  if (!enabled) return;

  const Component = props => <Draggable {...props} />;
  Component.displayName = 'BlockDraggable';
  return Component;
};

function Draggable(props) {
  const { children, editor, element, path } = props;
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;

  const { isDragging, multiplePreviewRef, previewRef, handleRef } =
    useDraggable({
      element,
      onDropHandler: (_, { dragItem }) => {
        const id = dragItem.id;

        if (blockSelectionApi) {
          blockSelectionApi.add(id);
        }
        multiplePreviewRef.current?.replaceChildren();
      },
    });

  const isInColumn = path.length === 3;
  const isInTable = path.length === 4;

  const [multiplePreviewTop, setMultiplePreviewTop] = React.useState(0);
  const [isMultiple, setIsMultiple] = React.useState(false);

  // clear up virtual multiple preview when drag end
  React.useEffect(() => {
    if (!isDragging && isMultiple) {
      multiplePreviewRef.current?.replaceChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const [dragButtonTop, setDragButtonTop] = React.useState(0);

  return (
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        getPluginByType(editor, element.type)?.node.isContainer
          ? 'group/container'
          : 'group'
      )}
      onMouseEnter={() => {
        if (isDragging) return;
        setDragButtonTop(calcDragButtonTop(editor, element));
      }}
    >
      {!isInTable && (
        <Gutter>
          <div
            className={cn(
              'slate-blockToolbarWrapper',
              'flex h-[1.5em]',
              isInColumn && 'h-4'
            )}
          >
            <div
              className={cn(
                'slate-blockToolbar relative w-4.5',
                'pointer-events-auto mr-1 flex items-center',
                isInColumn && 'mr-1.5'
              )}
            >
              <Button
                ref={handleRef}
                variant="ghost"
                className="absolute -left-0 h-6 w-full p-0"
                style={{ top: `${dragButtonTop + 3}px` }}
                data-plate-prevent-deselect
              >
                <DragHandle
                  isDragging={isDragging}
                  isMultiple={isMultiple}
                  multiplePreviewRef={multiplePreviewRef}
                  setIsMultiple={setIsMultiple}
                  setMultiplePreviewTop={setMultiplePreviewTop}
                />
              </Button>
            </div>
          </div>
        </Gutter>
      )}
      <div
        ref={multiplePreviewRef}
        className={cn('absolute -left-0 hidden w-full')}
        style={{ top: `${-multiplePreviewTop}px` }}
        contentEditable={false}
      />
      <div ref={previewRef} className="slate-blockWrapper flow-root">
        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  );
}

function Gutter({ children, className, ...props }) {
  const editor = useEditorRef();
  const element = useElement();
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const selected = useSelected();

  return (
    <div
      {...props}
      className={cn(
        'slate-gutterLeft',
        'absolute top-0 z-50 flex h-full -translate-x-full cursor-text hover:opacity-100 sm:opacity-0',
        getPluginByType(editor, element.type)?.node.isContainer
          ? 'group-hover/container:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        className
      )}
      contentEditable={false}
    >
      {children}
    </div>
  );
}

const DragHandle = React.memo(function DragHandle({
  isDragging,
  isMultiple,
  multiplePreviewRef,
  setIsMultiple,
  setMultiplePreviewTop,
}) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex size-full items-center justify-center"
          onClick={() => {
            editor.getApi(BlockSelectionPlugin).blockSelection.set(element.id);
          }}
          onMouseDown={e => {
            if (e.button !== 0 || e.shiftKey) return; // Only left mouse button

            if (isMultiple) {
              const elements = createDragPreviewElements(editor);
              multiplePreviewRef.current?.append(...elements);
              multiplePreviewRef.current?.classList.remove('hidden');
            } else {
              editor.setOption(DndPlugin, 'draggingId', null);
              return;
            }
          }}
          onMouseEnter={() => {
            if (isDragging) return;

            const isSelected = editor.getOption(
              BlockSelectionPlugin,
              'isSelected',
              element.id
            );

            if (isSelected) {
              const previewTop = calculatePreviewTop(editor, element);
              setMultiplePreviewTop(previewTop);
              setIsMultiple(true);
            } else {
              setIsMultiple(false);
            }
          }}
          onMouseUp={() => {
            multiplePreviewRef.current?.replaceChildren();
            setIsMultiple(false);
          }}
          role="button"
        >
          <GripVertical className="text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>Drag to move</TooltipContent>
    </Tooltip>
  );
});

const DropLine = React.memo(function DropLine({ className, ...props }) {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
      {...props}
      className={cn(
        'slate-dropLine',
        'absolute inset-x-0 h-0.5 opacity-100 transition-opacity',
        'bg-brand/50',
        dropLine === 'top' && '-top-px',
        dropLine === 'bottom' && '-bottom-px',
        className
      )}
    />
  );
});

const createDragPreviewElements = editor => {
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;

  const sortedNodes = blockSelectionApi.getNodes({
    sort: true,
  });

  const elements = [];
  const ids = [];

  /**
   * Remove data attributes from the element to avoid recognized as slate
   * elements incorrectly.
   */
  const removeDataAttributes = element => {
    Array.from(element.attributes).forEach(attr => {
      if (
        attr.name.startsWith('data-slate') ||
        attr.name.startsWith('data-block-id')
      ) {
        element.removeAttribute(attr.name);
      }
    });

    Array.from(element.children).forEach(child => {
      removeDataAttributes(child);
    });
  };

  const resolveElement = (node, index) => {
    const domNode = editor.api.toDOMNode(node);

    const newDomNode = domNode.cloneNode(true);

    ids.push(node.id);
    const wrapper = document.createElement('div');
    wrapper.append(newDomNode);
    wrapper.style.display = 'flow-root';

    const lastDomNode = sortedNodes[index - 1];

    if (lastDomNode) {
      const lastDomNodeRect = editor.api
        .toDOMNode(lastDomNode[0])
        .parentElement.getBoundingClientRect();

      const domNodeRect = domNode.parentElement.getBoundingClientRect();

      const distance = domNodeRect.top - lastDomNodeRect.bottom;

      // Check if the two elements are adjacent (touching each other)
      if (distance > 15) {
        wrapper.style.marginTop = `${distance}px`;
      }
    }

    removeDataAttributes(newDomNode);
    elements.push(wrapper);
  };

  sortedNodes.forEach(([node], index) => resolveElement(node, index));

  editor.setOption(DndPlugin, 'draggingId', ids);

  return elements;
};

const calculatePreviewTop = (editor, element) => {
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;

  const child = editor.api.toDOMNode(element);
  const editable = editor.api.toDOMNode(editor);
  const firstSelectedChild = editor.api.node(blockSelectionApi.first()[0]);

  const firstDomNode = editor.api.toDOMNode(firstSelectedChild[0]);
  // Get editor's top padding
  const editorPaddingTop = Number(
    window.getComputedStyle(editable).paddingTop.replace('px', '')
  );

  // Calculate distance from first selected node to editor top
  const firstNodeToEditorDistance =
    firstDomNode.getBoundingClientRect().top -
    editable.getBoundingClientRect().top -
    editorPaddingTop;

  // Get margin top of first selected node
  const firstMarginTopString = window.getComputedStyle(firstDomNode).marginTop;
  const marginTop = Number(firstMarginTopString.replace('px', ''));

  // Calculate distance from current node to editor top
  const currentToEditorDistance =
    child.getBoundingClientRect().top -
    editable.getBoundingClientRect().top -
    editorPaddingTop;

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  const previewElementsTopDistance =
    currentToEditorDistance -
    firstNodeToEditorDistance +
    marginTop -
    currentMarginTop;

  return previewElementsTopDistance;
};

const calcDragButtonTop = (editor, element) => {
  const child = editor.api.toDOMNode(element);

  const currentMarginTopString = window.getComputedStyle(child).marginTop;
  const currentMarginTop = Number(currentMarginTopString.replace('px', ''));

  return currentMarginTop;
};
