import { Range } from 'ace-builds';
import { createContext, getAllOccurrencesInScope } from 'js-slang';
import React from 'react';

import { EditorHook } from './Editor';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useRefactor: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const { sourceChapter } = inProps;

  const refactor = React.useCallback(() => {
    const editor = reactAceRef.current!.editor;
    if (!editor) {
      return;
    }
    const code = editor.getValue();
    const position = editor.getCursorPosition();
    const sourceLocations = getAllOccurrencesInScope(code, createContext(sourceChapter), {
      line: position.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
      column: position.column
    });

    const selection = editor.getSelection();
    const ranges = sourceLocations.map(
      loc => new Range(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
    );
    ranges.forEach(range => selection.addRange(range));
  }, [reactAceRef, sourceChapter]);

  keyBindings.refactor = refactor;
};

export default useRefactor;
