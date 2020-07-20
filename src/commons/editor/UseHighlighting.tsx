import { Ace, Range as AceRange } from 'ace-builds';
import { createContext, getAllOccurrencesInScope, getScope } from 'js-slang';
import * as React from 'react';

import { EditorHook } from './Editor';

const useHighlighting: EditorHook = (inProps, outProps, keyBindings, reactAceRef) => {
  const markerIdsRef = React.useRef<Array<number>>([]);

  // editorValue is the prop that is going to change all the time
  // use a ref so that the callbacks below can be memoised
  const editorValueRef = React.useRef<string>(inProps.editorValue);
  React.useEffect(() => {
    editorValueRef.current = inProps.editorValue;
  }, [inProps.editorValue]);

  const { sourceChapter } = inProps;
  const handleVariableHighlighting = React.useCallback(() => {
    // using Ace Editor's way of highlighting as seen here: https://github.com/ajaxorg/ace/blob/master/lib/ace/editor.js#L497
    // We use async blocks so we don't block the browser during editing

    setTimeout(() => {
      if (!reactAceRef.current) {
        return;
      }
      const editor = reactAceRef.current.editor;
      const session: Ace.EditSession = editor.session;
      const code = editorValueRef.current;
      const chapterNumber = sourceChapter;
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
  }, [reactAceRef, sourceChapter]);

  const handleHighlightScope = React.useCallback(() => {
    if (!reactAceRef.current) {
      return;
    }
    const code = editorValueRef.current;
    const chapter = sourceChapter;
    const position = reactAceRef.current.editor.getCursorPosition();

    const ranges = getScope(code, createContext(chapter), {
      line: position.row + 1,
      column: position.column
    });

    if (ranges.length !== 0) {
      ranges.forEach(range => {
        // Highlight the scope ranges
        markerIdsRef.current.push(
          reactAceRef.current!.editor.session.addMarker(
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
  }, [reactAceRef, sourceChapter]);

  const { onChange: prevOnChange, onCursorChange: prevOnCursorChange } = outProps;
  outProps.onChange = (...args) => {
    handleVariableHighlighting();
    prevOnChange && prevOnChange(...args);
  };
  outProps.onCursorChange = (...args) => {
    handleVariableHighlighting();
    prevOnCursorChange && prevOnCursorChange(...args);
  };
  keyBindings.highlightScope = handleHighlightScope;
};

export default useHighlighting;
