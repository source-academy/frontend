import { createContext } from 'js-slang';
import { Chapter } from 'js-slang/dist/langs';
import React, { useRef } from 'react';

import { useActiveAceMode } from './useActiveAceMode';

/**
 * Scope highlighting, go-to-definition and rename-in-scope parse the editor's contents with
 * js-slang on the main thread. That only makes sense for Source, so the editor hooks do nothing
 * for other languages (parsing Python as JavaScript highlights nonsense).
 *
 * Whether the selected language is Source is read from its Ace mode, which the evaluator itself
 * publishes (`ace/mode/source<chapter>`, see `features/conductor/AutocompletePlugin.ts`).
 *
 * Source chapters differ only in which syntax they reject, which is irrelevant to scope analysis,
 * so the widest one is used for all of them.
 */
export const createAnalysisContext = () => createContext(Chapter.SOURCE_4);

/** A ref, so that callbacks created once per editor still see the current language. */
export const useSourceAnalysisEnabled = (): React.RefObject<boolean> => {
  const enabled = useRef(false);
  enabled.current = useActiveAceMode().startsWith('ace/mode/source');
  return enabled;
};
