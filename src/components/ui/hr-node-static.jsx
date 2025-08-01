import * as React from 'react';

import { SlateElement } from 'platejs';

import { cn } from '@/lib/utils';

export function HrElementStatic(props) {
  return (
    <SlateElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            'h-0.5 rounded-sm border-none bg-muted bg-clip-content'
          )}
        />
      </div>
      {props.children}
    </SlateElement>
  );
}
