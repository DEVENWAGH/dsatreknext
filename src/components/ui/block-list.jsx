'use client';
import React from 'react';

import { isOrderedList } from '@platejs/list';
import {
  useTodoListElement,
  useTodoListElementState,
} from '@platejs/list/react';
import { useReadOnly } from 'platejs/react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const config = {
  todo: {
    Li: TodoLi,
    Marker: TodoMarker,
  },
};

export const BlockList = props => {
  if (!props.element.listStyleType) return;

  const Component = props => <List {...props} />;
  Component.displayName = 'BlockList';
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

function TodoMarker(props) {
  const state = useTodoListElementState({ element: props.element });
  const { checkboxProps } = useTodoListElement(state);
  const readOnly = useReadOnly();

  return (
    <div contentEditable={false}>
      <Checkbox
        className={cn(
          'absolute top-1 -left-6',
          readOnly && 'pointer-events-none'
        )}
        {...checkboxProps}
      />
    </div>
  );
}

function TodoLi(props) {
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
