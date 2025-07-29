'use client';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { isSlateEditor, isSlateElement, isSlateString } from 'platejs';
import { toTPlatePlugin } from 'platejs/react';

import { BlockSuggestion } from '@/components/ui/block-suggestion';
import {
  SuggestionLeaf,
  SuggestionLineBreak,
} from '@/components/ui/suggestion-node';

import { discussionPlugin } from './discussion-kit';

export const suggestionPlugin = toTPlatePlugin(
  BaseSuggestionPlugin,
  ({ editor }) => ({
    options: {
      activeId: null,
      currentUserId: editor.getOption(discussionPlugin, 'currentUserId'),
      hoverId: null,
      uniquePathMap: new Map(),
    },
  })
).configure({
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ api, event, setOption, type }) => {
      let leaf = event.target;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (
        leaf.parentElement &&
        !isSlateElement(leaf.parentElement) &&
        !isSlateEditor(leaf.parentElement)
      ) {
        if (leaf.classList.contains(`slate-${type}`)) {
          const suggestionEntry = api.suggestion.node({ isText: true });

          if (!suggestionEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = api.suggestion.nodeId(suggestionEntry[0]);

          setOption('activeId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
  render: {
    belowNodes: SuggestionLineBreak,
    node: SuggestionLeaf,
    belowRootNodes: ({ api, element }) => {
      if (!api.suggestion.isBlockSuggestion(element)) {
        return null;
      }

      return <BlockSuggestion element={element} />;
    },
  },
});

export const SuggestionKit = [suggestionPlugin];
