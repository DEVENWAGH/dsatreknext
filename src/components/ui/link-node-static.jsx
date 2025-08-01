import * as React from 'react';

import { getLinkAttributes } from '@platejs/link';
import { SlateElement } from 'platejs';

export function LinkElementStatic(props) {
  return (
    <SlateElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
      attributes={{
        ...props.attributes,
        ...getLinkAttributes(props.editor, props.element),
      }}
    >
      {props.children}
    </SlateElement>
  );
}
