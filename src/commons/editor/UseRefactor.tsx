import { Range } from 'ace-builds';
import { useCallback } from 'react';

import type { EditorHook } from './Editor';
import { captureAnalysisRequest, useAnalysis } from './useAnalysis';

// EditorHook structure:
// EditorHooks grant access to 4 things:
// inProps are provided by the parent component
// outProps go into the underlying React-Ace
// keyBindings allow exporting new hotkeys
// reactAceRef is the underlying reactAce instance for hooking.

const useRefactor: EditorHook = (_inProps, _outProps, keyBindings, reactAceRef) => {
  const analysis = useAnalysis();

  const refactor = useCallback(async () => {
    const editor = reactAceRef.current?.editor;
    if (!editor || !analysis.current?.capabilities.occurrences) {
      return;
    }
    const request = captureAnalysisRequest(editor, analysis);
    const occurrences = await request.provider!.occurrences(request.code, request.position);

    // The ranges are those of the code, the cursor and the evaluator of the request: not of what
    // is there now (they would be selected beside the user's own selection, and typing would
    // rename the old name as well as the new one).
    if (!request.isCurrent()) {
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
