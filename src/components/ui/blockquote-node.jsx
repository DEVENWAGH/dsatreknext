'use client';

import { PlateElement } from 'platejs/react';

export function BlockquoteElement(props) {
  return (
    <PlateElement
      as="blockquote"
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
