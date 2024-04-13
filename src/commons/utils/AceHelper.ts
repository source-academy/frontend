import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Chapter, Variant } from 'js-slang/dist/types';

import { HighlightRulesSelector_native } from '../../features/fullJS/fullJSHighlight';
import { Documentation } from '../documentation/Documentation';
/**
 * This _modifies global state_ and defines a new Ace mode globally, if it does not already exist.
 *
 * You can call this directly in render functions.
 */
export const selectMode = (chapter: Chapter, variant: Variant, library: string) => {
  if (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof ace.define.modules[`ace/mode/${getModeString(chapter, variant, library)}`]?.Mode ===
    'function'
  ) {
    return;
  }

  if (chapter !== Chapter.FULL_JS) {
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

export const getModeString = (chapter: Chapter, variant: Variant, library: string) => {
  // TODO: Create our own highlighting rules for the different sublanguages
  switch (chapter) {
    case Chapter.HTML:
      return 'html';
    case Chapter.FULL_TS:
      return 'typescript';
    case Chapter.PYTHON_1:
    case Chapter.PYTHON_2:
    case Chapter.PYTHON_3:
    case Chapter.PYTHON_4:
    case Chapter.FULL_PYTHON:
      return 'python';
    case Chapter.SCHEME_1:
    case Chapter.SCHEME_2:
    case Chapter.SCHEME_3:
    case Chapter.SCHEME_4:
    case Chapter.FULL_SCHEME:
      return 'scheme';
    case Chapter.FULL_JAVA:
      return 'java';
    case Chapter.FULL_C:
      return 'c_cpp';
    default:
      return `source${chapter}${variant}${library}`;
  }
};
