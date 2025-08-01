import * as React from 'react';

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { SlateLeaf } from 'platejs';

import { cn } from '@/lib/utils';

export function SuggestionLeafStatic(props) {
  const { editor, leaf } = props;

  const dataList = editor
    .getApi(BaseSuggestionPlugin)
    .suggestion.dataList(leaf);
  const hasRemove = dataList.some(data => data.type === 'remove');
  const diffOperation = {
    type: hasRemove ? 'delete' : 'insert',
  };

  const Component = {
    delete: 'del',
    insert: 'ins',
    update: 'span',
  }[diffOperation.type];

  return (
    <SlateLeaf
      {...props}
      as={Component}
      className={cn(
        'border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200',
        hasRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through'
      )}
    >
      {props.children}
    </SlateLeaf>
  );
}
