'use client';
import * as React from 'react';

import { getLinkAttributes } from '@platejs/link';
import { PlateElement } from 'platejs/react';

export function LinkElement(props) {
  return (
    <PlateElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
      attributes={{
        ...props.attributes,
        ...getLinkAttributes(props.editor, props.element),
        onMouseOver: e => {
          e.stopPropagation();
        },
      }}
    >
      {props.children}
    </PlateElement>
  );
}
