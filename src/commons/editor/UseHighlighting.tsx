import { Ace, Range as AceRange } from 'ace-builds';
import { useCallback, useEffect, useRef } from 'react';

import type { EditorHook } from './Editor';
import { captureAnalysisRequest, useAnalysis } from './useAnalysis';

const useHighlighting: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const analysis = useAnalysis();
  const markerIdsRef = useRef<Array<number>>([]);
  // Numbers the requests for the variable highlighting, so that an answer that a later request has
  // overtaken (the cursor has moved on) is dropped.
  const latestRequestRef = useRef(0);

  const clearMarkers = useCallback(() => {
    const session = reactAceRef.current?.editor.session;
    markerIdsRef.current.forEach(id => session?.removeMarker(id));
    markerIdsRef.current = [];
  }, [reactAceRef]);

  // Markers outlive a change of the session's mode, so switching to an evaluator that does not
  // provide the occurrences (or one that no longer says that it does) has to remove them explicitly.
  const isEnabled = !!analysis.current?.capabilities.occurrences;
  useEffect(() => {
    if (!isEnabled) {
      clearMarkers();
    }
  }, [isEnabled, clearMarkers]);

  const handleVariableHighlighting = useCallback(() => {
    // using Ace Editor's way of highlighting as seen here: https://github.com/ajaxorg/ace/blob/master/lib/ace/editor.js#L497
    // We use async blocks so we don't block the browser during editing

    const request = ++latestRequestRef.current;
    setTimeout(async () => {
      if (!reactAceRef.current) {
        return;
      }
      const provider = analysis.current;
      if (!provider?.capabilities.occurrences) {
        clearMarkers();
        return;
      }
      const editor = reactAceRef.current.editor;
      const session: Ace.EditSession = editor.session;
      if (!session || !(session as any).bgTokenizer) {
        return;
      }
      const asked = captureAnalysisRequest(editor, analysis);
      const occurrences = await provider.occurrences(asked.code, asked.position);
      // A later request has been made while the evaluator was answering this one, or the editor
      // is not what it was (the cursor, the code, the tab, the evaluator).
      if (request !== latestRequestRef.current || !reactAceRef.current || !asked.isCurrent()) {
        return;
      }
      markerIdsRef.current.forEach(id => {
        session.removeMarker(id);
      });
      const markerType = 'ace_variable_highlighting';
      markerIdsRef.current = occurrences.map(({ start, end }) =>
        // returns the marker ID for removal later
        session.addMarker(
          new AceRange(start.line, start.character, end.line, end.character),
          markerType,
          'text',
        ),
      );
    }, 10);
  }, [reactAceRef, analysis, clearMarkers]);

  const handleHighlightScope = useCallback(async () => {
    if (!reactAceRef.current || !analysis.current?.capabilities.scope) {
      return;
    }
    const editor = reactAceRef.current.editor;
    const asked = captureAnalysisRequest(editor, analysis);

    const ranges = await asked.provider!.scope(asked.code, asked.position);

    // The ranges are for the editor as it was asked: not for what is there now (the cursor may
    // have moved on, and the markers of the old position have been replaced).
    if (!reactAceRef.current || !asked.isCurrent()) {
      return;
    }
    ranges.forEach(({ start, end }) => {
      // Highlight the scope ranges
      markerIdsRef.current.push(
        editor.session.addMarker(
          new AceRange(start.line, start.character, end.line, end.character),
          'ace_selection',
          'text',
        ),
      );
    });
  }, [reactAceRef, analysis]);

  const { onChange: prevOnChange, onCursorChange: prevOnCursorChange } = outProps;
  outProps.onChange = useCallback(
    (value: string, event?: any) => {
      handleVariableHighlighting();
      prevOnChange?.(value, event);
    },
    [handleVariableHighlighting, prevOnChange],
  );
  outProps.onCursorChange = useCallback(
    (value: any, event?: any) => {
      handleVariableHighlighting();
      prevOnCursorChange?.(value, event);
    },
    [handleVariableHighlighting, prevOnCursorChange],
  );
  keyBindings.highlightScope = handleHighlightScope;
};

export default useHighlighting;
