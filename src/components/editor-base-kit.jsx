import { BaseBasicBlocksKit } from './basic-blocks-base-kit';
import { BaseBasicMarksKit } from './basic-marks-base-kit';
import { BaseCalloutKit } from './callout-base-kit';
import { BaseCodeBlockKit } from './code-block-base-kit';
import { BaseColumnKit } from './column-base-kit';
import { BaseCommentKit } from './comment-base-kit';
import { BaseDateKit } from './date-base-kit';
import { BaseLinkKit } from './link-base-kit';
import { BaseListKit } from './list-base-kit';
import { BaseMathKit } from './math-base-kit';
import { BaseMediaKit } from './media-base-kit';
import { BaseMentionKit } from './mention-base-kit';
import { BaseSuggestionKit } from './suggestion-base-kit';
import { BaseTableKit } from './table-base-kit';
import { BaseTocKit } from './toc-base-kit';
import { BaseToggleKit } from './toggle-base-kit';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseCodeBlockKit,
  ...BaseTableKit,
  ...BaseToggleKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  ...BaseCalloutKit,
  ...BaseColumnKit,
  ...BaseMathKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...BaseBasicMarksKit,
  ...BaseListKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
];
