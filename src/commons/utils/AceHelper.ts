import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Chapter, Variant } from 'js-slang/dist/types';

import { HighlightRulesSelector_native } from '../../features/fullJS/fullJSHighlight';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
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

import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-scheme';
import 'ace-builds/src-noconflict/mode-typescript';
import 'js-slang/dist/editors/ace/theme/source';

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

export const parseModeString = (
  modeString: string
): { chapter: Chapter; variant: Variant; library: ExternalLibraryName } => {
  switch (modeString) {
    case 'html':
      return { chapter: Chapter.HTML, variant: Variant.DEFAULT, library: ExternalLibraryName.NONE };
    case 'typescript':
      return {
        chapter: Chapter.FULL_TS,
        variant: Variant.DEFAULT,
        library: ExternalLibraryName.NONE
      };
    case 'python':
      return {
        chapter: Chapter.PYTHON_1,
        variant: Variant.DEFAULT,
        library: ExternalLibraryName.NONE
      };
    case 'scheme':
      return {
        chapter: Chapter.FULL_SCHEME,
        variant: Variant.EXPLICIT_CONTROL,
        library: ExternalLibraryName.NONE
      };
    case 'java':
      return {
        chapter: Chapter.FULL_JAVA,
        variant: Variant.DEFAULT,
        library: ExternalLibraryName.NONE
      };
    case 'c_cpp':
      return {
        chapter: Chapter.FULL_C,
        variant: Variant.DEFAULT,
        library: ExternalLibraryName.NONE
      };
    default: {
      const matches = modeString.match(/source(-?\d+)([a-z-]+)([A-Z]+)/);
      if (!matches) {
        throw new Error('Invalid modeString');
      }
      const [_, chapter, variant, externalLibraryName] = matches;
      return {
        chapter:
          chapter === '1'
            ? Chapter.SOURCE_1
            : chapter === '2'
              ? Chapter.SOURCE_2
              : chapter === '3'
                ? Chapter.SOURCE_3
                : Chapter.SOURCE_4,
        variant: Variant[variant as keyof typeof Variant] || Variant.DEFAULT,
        library:
          ExternalLibraryName[externalLibraryName as keyof typeof ExternalLibraryName] ||
          ExternalLibraryName.NONE
      };
    }
  }
};
