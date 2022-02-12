import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { isFullJSChapter } from 'js-slang/dist/runner/utils';
import { Variant } from 'js-slang/dist/types';

import { HighlightRulesSelector_native } from '../../features/fullJS/fullJSHighlight';
import { Documentation } from '../documentation/Documentation';
/**
 * This _modifies global state_ and defines a new Ace mode globally, if it does not already exist.
 *
 * You can call this directly in render functions.
 */
export const selectMode = (chapter: number, variant: Variant, library: string) => {
  if (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof ace.define.modules[`ace/mode/${getModeString(chapter, variant, library)}`]?.Mode ===
    'function'
  ) {
    return;
  }

  if (!isFullJSChapter(chapter)) {
    HighlightRulesSelector(chapter, variant, library, Documentation.externalLibraries[library]);
  } else {
    HighlightRulesSelector_native(
      chapter,
      variant,
      library,
      Documentation.externalLibraries[library]
    );
  }
  ModeSelector(chapter, variant, library);
};

export const getModeString = (chapter: number, variant: Variant, library: string) =>
  `source${chapter}${variant}${library}`;
