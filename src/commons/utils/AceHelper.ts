import { isNativeJSLang } from './../application/ApplicationTypes';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Variant } from 'js-slang/dist/types';

import { Documentation } from '../documentation/Documentation';
import { HighlightRulesSelector_native } from '../nativeJS/NativeJSHighlight';

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

  if (isNativeJSLang(chapter)) {
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
