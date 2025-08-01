'use client';

import * as React from 'react';

import { useMarkToolbarButton, useMarkToolbarButtonState } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function MarkToolbarButton({ clear, nodeType, ...props }) {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);

  return <ToolbarButton {...props} {...buttonProps} />;
}
