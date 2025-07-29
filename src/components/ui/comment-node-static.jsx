import * as React from 'react';

import { SlateLeaf } from 'platejs';

export function CommentLeafStatic(props) {
  return (
    <SlateLeaf
      {...props}
      className="border-b-2 border-b-highlight/35 bg-highlight/15"
    >
      {props.children}
    </SlateLeaf>
  );
}
