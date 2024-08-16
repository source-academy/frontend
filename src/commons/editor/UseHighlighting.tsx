import { Ace, Range as AceRange } from 'ace-builds';
import { createContext, getAllOccurrencesInScope, getScope } from 'js-slang';
import React from 'react';

import { EditorHook } from './Editor';

const useHighlighting: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const propsRef = React.useRef(inProps);
  propsRef.current = inProps;
  const markerIdsRef = React.useRef<Array<number>>([]);

  const handleVariableHighlighting = React.useCallback(() => {
    // using Ace Editor's way of highlighting as seen here: https://github.com/ajaxorg/ace/blob/master/lib/ace/editor.js#L497
    // We use async blocks so we don't block the browser during editing

    setTimeout(() => {
      if (!reactAceRef.current) {
        return;
      }
      const editor = reactAceRef.current.editor;
      const session: Ace.EditSession = editor.session;
      const code = session.getValue();
      const chapterNumber = propsRef.current.sourceChapter;
      const position = editor.getCursorPosition();
      if (!session || !(session as any).bgTokenizer) {
        return;
      }
      markerIdsRef.current.forEach(id => {
        session.removeMarker(id);
      });
      const ranges = getAllOccurrencesInScope(code, createContext(chapterNumber), {
        line: position.row + 1,
        column: position.column
      }).map(
        loc => new AceRange(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
      );

      const markerType = 'ace_variable_highlighting';
      markerIdsRef.current = ranges.map(range => {
        // returns the marker ID for removal later
        return session.addMarker(range, markerType, 'text');
      });
    }, 10);
  }, [reactAceRef]);

  const handleHighlightScope = React.useCallback(() => {
    if (!reactAceRef.current) {
      return;
    }
    const editor = reactAceRef.current.editor;
    const code = editor.getValue();
    const chapter = propsRef.current.sourceChapter;
    const position = editor.getCursorPosition();

    const ranges = getScope(code, createContext(chapter), {
      line: position.row + 1,
      column: position.column
    });

    if (ranges.length !== 0) {
      ranges.forEach(range => {
        // Highlight the scope ranges
        markerIdsRef.current.push(
          editor.session.addMarker(
            new AceRange(
              range.start.line - 1,
              range.start.column,
              range.end.line - 1,
              range.end.column
            ),
            'ace_selection',
            'text'
          )
        );
      });
    }
  }, [reactAceRef]);

  const { onChange: prevOnChange, onCursorChange: prevOnCursorChange } = outProps;
  outProps.onChange = React.useCallback(
    (value: string, event?: any) => {
      handleVariableHighlighting();
      prevOnChange?.(value, event);
    },
    [handleVariableHighlighting, prevOnChange]
  );
  outProps.onCursorChange = React.useCallback(
    (value: any, event?: any) => {
      handleVariableHighlighting();
      prevOnCursorChange?.(value, event);
    },
    [handleVariableHighlighting, prevOnCursorChange]
  );
  keyBindings.highlightScope = handleHighlightScope;
};

export default useHighlighting;
