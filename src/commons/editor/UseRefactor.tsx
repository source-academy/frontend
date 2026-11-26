import { Range } from 'ace-builds';
import { useCallback } from 'react';

import type { EditorHook } from './Editor';
import { useAnalysis } from './useAnalysis';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useRefactor: EditorHook = (_inProps, _outProps, keyBindings, reactAceRef) => {
  const analysis = useAnalysis();

  const refactor = useCallback(async () => {
    const provider = analysis.current;
    const editor = reactAceRef.current?.editor;
    if (!editor || !provider?.capabilities.occurrences) {
      return;
    }
    const code = editor.getValue();
    const position = editor.getCursorPosition();
    const occurrences = await provider.occurrences(code, {
      line: position.row,
      character: position.column,
    });

    // The ranges are those of the code of the request: not of what is there now.
    if (editor.getValue() !== code) {
      return;
    }
    const selection = editor.getSelection();
    occurrences.forEach(({ start, end }) =>
      selection.addRange(new Range(start.line, start.character, end.line, end.character)),
    );
  }, [reactAceRef, analysis]);

  keyBindings.refactor = refactor;
};

export default useRefactor;
