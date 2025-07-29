import * as React from 'react';

import { isOrderedList } from '@platejs/list';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const config = {
  todo: {
    Li: TodoLiStatic,
    Marker: TodoMarkerStatic,
  },
};

export const BlockListStatic = props => {
  if (!props.element.listStyleType) return;

  const Component = props => <List {...props} />;
  Component.displayName = 'BlockListStatic';
  return Component;
};

function List(props) {
  const { listStart, listStyleType } = props.element;
  const { Li, Marker } = config[listStyleType] ?? {};
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      className="relative m-0 p-0"
      style={{ listStyleType }}
      start={listStart}
    >
      {Marker && <Marker {...props} />}
      {Li ? <Li {...props} /> : <li>{props.children}</li>}
    </List>
  );
}

function TodoMarkerStatic(props) {
  const checked = props.element.checked;

  return (
    <div contentEditable={false}>
      <button
        className={cn(
          'peer pointer-events-none absolute top-1 -left-6 size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          props.className
        )}
        data-state={checked ? 'checked' : 'unchecked'}
        type="button"
      >
        <div className={cn('flex items-center justify-center text-current')}>
          {checked && <CheckIcon className="size-4" />}
        </div>
      </button>
    </div>
  );
}

function TodoLiStatic(props) {
  return (
    <li
      className={cn(
        'list-none',
        props.element.checked && 'text-muted-foreground line-through'
      )}
    >
      {props.children}
    </li>
  );
}
