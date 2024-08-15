/* eslint-disable simple-import-sort/imports */

// Next line necessary to prevent "ReferenceError: ace is not defined" error.
// See https://github.com/securingsincity/react-ace/issues/1233 (although there is no explanation).
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-settings_menu';
import 'js-slang/dist/editors/ace/theme/source';

/**
 * ace-builds/webpack-resolver is causing some issues in the testing environment.
 * Without it, we have to manually import the following keybindings to ensure they are packaged
 * together with the editor during lazy loading.
 *
 * Supersedes changes from: https://github.com/source-academy/frontend/issues/2543
 */
import 'ace-builds/src-noconflict/keybinding-emacs';
import 'ace-builds/src-noconflict/keybinding-vim';

import { Card } from '@blueprintjs/core';
import * as AceBuilds from 'ace-builds';
import { Ace, require as acequire, createEditSession } from 'ace-builds';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';
import AceEditor, { IAceEditorProps, IEditorProps } from 'react-ace';
import { IAceEditor } from 'react-ace/lib/types';
import { EditorBinding } from '../WorkspaceSettingsContext';
import { getModeString, selectMode } from '../utils/AceHelper';
import { objectEntries } from '../utils/TypeHelper';
import { KeyFunction, keyBindings } from './EditorHotkeys';
import { AceMouseEvent, HighlightedLines, Position } from './EditorTypes';

// =============== Hooks ===============
// TODO: Should further refactor into EditorBase + different variants.
// Ideally, hooks should be specified by the parent component instead.
import useHighlighting from './UseHighlighting';
import useNavigation from './UseNavigation';
import useRefactor from './UseRefactor';
import useShareAce from './UseShareAce';

export type EditorKeyBindingHandlers = { [name in KeyFunction]?: () => void };
export type EditorHook = (
  inProps: Readonly<EditorProps>,
  outProps: IAceEditorProps,
  keyBindings: EditorKeyBindingHandlers,
  reactAceRef: React.MutableRefObject<AceEditor | null>
) => void;

export type EditorProps = DispatchProps & EditorStateProps & EditorTabStateProps & OnEvent;

type DispatchProps = {
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleSendReplInputToOutput?: (newOutput: string) => void;
  handleSetSharedbConnected?: (connected: boolean) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
};

type EditorStateProps = {
  editorSessionId: string;
  sessionDetails: { docId: string; readOnly: boolean } | null;
  isEditorAutorun: boolean;
  sourceChapter?: Chapter;
  externalLibraryName?: string;
  sourceVariant?: Variant;
  hooks?: EditorHook[];
  editorBinding?: EditorBinding;
};

export type EditorTabStateProps = {
  editorTabIndex: number;
  filePath?: string;
  editorValue: string;
  highlightedLines: HighlightedLines[];
  breakpoints: string[];
  newCursorPosition?: Position;
};

type LocalStateProps = {
  session: Ace.EditSession;
};

type OnEvent = {
  onSelectionChange?: (value: any, event?: any) => void;
  onCursorChange?: (value: any, event?: any) => void;
  onInput?: (event?: any) => void;
  onLoad?: (editor: Ace.Editor) => void;
  onValidate?: (annotations: Ace.Annotation[]) => void;
  onBeforeLoad?: (ace: typeof AceBuilds) => void;
  onChange?: (value: string, event?: any) => void;
  onSelection?: (selectedText: string, event?: any) => void;
  onCopy?: (value: string) => void;
  onPaste?: (value: string) => void;
  onFocus?: (event: any, editor?: Ace.Editor) => void;
  onBlur?: (event: any, editor?: Ace.Editor) => void;
  onScroll?: (editor: IEditorProps) => void;
};

const EventT: Array<keyof OnEvent> = [
  'onSelectionChange',
  'onCursorChange',
  'onInput',
  'onLoad',
  'onValidate',
  'onBeforeLoad',
  'onChange',
  'onSelection',
  'onCopy',
  'onPaste',
  'onFocus',
  'onBlur',
  'onScroll'
];

const getMarkers = (
  highlightedLines: EditorTabStateProps['highlightedLines']
): IAceEditorProps['markers'] => {
  return highlightedLines.map(lineNums => ({
    startRow: lineNums[0],
    startCol: 0,
    endRow: lineNums[1],
    endCol: 1,
    className: 'myMarker',
    type: 'fullLine'
  }));
};

const makeHandleGutterClick =
  (
    handleEditorUpdateBreakpoints: DispatchProps['handleEditorUpdateBreakpoints'],
    editorTabIndex: number
  ) =>
  (e: AceMouseEvent) => {
    const target = e.domEvent.target! as HTMLDivElement;
    if (
      target.className.indexOf('ace_gutter-cell') === -1 ||
      !e.editor.isFocused() ||
      e.clientX > 35 + target.getBoundingClientRect().left
    ) {
      return;
    }

    // Breakpoint related.
    const row = e.getDocumentPosition().row;
    const content = e.editor.session.getLine(row);
    const breakpoints = e.editor.session.getBreakpoints();
    if (
      breakpoints[row] === undefined &&
      content.length !== 0 &&
      !content.includes('//') &&
      !content.includes('debugger;')
    ) {
      e.editor.session.setBreakpoint(row, undefined!);
    } else {
      e.editor.session.clearBreakpoint(row);
    }
    e.stop();
    handleEditorUpdateBreakpoints(editorTabIndex, e.editor.session.getBreakpoints());
  };

/**
 * Returns an array of breakpoint line numbers from the Ace Editor's breakpoint
 * array representation.
 *
 * Breakpoints are elements in the array with the value 'ace_breakpoint' where
 * the associated line number is the index of the element in the array.
 *
 * @param breakpoints The Ace Editor's breakpoint representation.
 */
const getBreakpointLineNumbers = (breakpoints: string[]): number[] => {
  const breakpointLineNumbers: number[] = [];
  breakpoints.forEach((value: string, index: number) => {
    if (value !== 'ace_breakpoint') {
      return;
    }
    breakpointLineNumbers.push(index);
  });
  return breakpointLineNumbers;
};

/**
 * Shifts breakpoints in accordance to changes in the code. This is a quality-of-life
 * feature that attempts to shift breakpoints together with changes made to the code
 * so as to provide a smoother debugging experience for the user. It is modelled after
 * the breakpoint shifting behaviour of popular code editors & IDEs such as Visual
 * Studio Code and JetBrains IDEs.
 *
 * @param editor The Ace Editor instance.
 * @param delta  An object representing the changes made to the code.
 */
const shiftBreakpointsWithCode = (editor: IAceEditor, delta: Ace.Delta) => {
  const getIndexOfFirstNonWhitespaceChar = (s: string): number => s.length - s.trimStart().length;
  const isWhitespace = (s: string): boolean => s.trim().length === 0;

  const oldBreakpoints = editor.session.getBreakpoints();
  const oldBreakpointLineNumbers = getBreakpointLineNumbers(oldBreakpoints);
  const newBreakpointLineNumbers: number[] = [];

  const deltaStartLineNumber = delta.start.row;
  const deltaStartColumnNumber = delta.start.column;
  const deltaEndLineNumber = delta.end.row;
  // Subtract 1 because one line of every change modifies an existing line.
  const deltaNumOfLinesModified = delta.lines.length - 1;

  for (const oldBreakpointLineNumber of oldBreakpointLineNumbers) {
    switch (delta.action) {
      case 'insert': {
        let shouldIncreaseBreakpointLineNumber: boolean;
        if (oldBreakpointLineNumber < deltaStartLineNumber) {
          // Line number of the breakpoint is unaffected since the changes happen on a later line.
          shouldIncreaseBreakpointLineNumber = false;
        } else if (oldBreakpointLineNumber === deltaStartLineNumber) {
          // Line number of the breakpoint is unaffected if the changes happen before the first
          // non-whitespace character on the same line. Otherwise, the line number of breakpoint
          // is increased by the number of lines added.
          const firstModifiedLine = editor.session.getLine(oldBreakpointLineNumber);
          const firstNonWhitespaceCharIndex = getIndexOfFirstNonWhitespaceChar(firstModifiedLine);
          shouldIncreaseBreakpointLineNumber =
            firstNonWhitespaceCharIndex >= deltaStartColumnNumber;
        } else {
          // Line number of the breakpoint is increased by the number of lines added since the changes
          // happen on an earlier line.
          shouldIncreaseBreakpointLineNumber = true;
        }
        const newBreakpointLineNumber =
          oldBreakpointLineNumber +
          (shouldIncreaseBreakpointLineNumber ? deltaNumOfLinesModified : 0);
        newBreakpointLineNumbers.push(newBreakpointLineNumber);
        break;
      }
      case 'remove': {
        let shouldDecreaseBreakpointLineNumber: boolean;
        if (oldBreakpointLineNumber < deltaStartLineNumber) {
          // Line number of the breakpoint is unaffected since the changes happen on a later line.
          shouldDecreaseBreakpointLineNumber = false;
        } else if (
          oldBreakpointLineNumber > deltaStartLineNumber &&
          oldBreakpointLineNumber < deltaEndLineNumber
        ) {
          // Breakpoint should be removed as the line it is on is deleted.
          break;
        } else if (oldBreakpointLineNumber === deltaStartLineNumber) {
          // Breakpoint should be removed if the first (partially) deleted line only has whitespace
          // characters remaining. Otherwise, the line number of the breakpoint should remain unchanged.
          const firstModifiedLine = editor.session.getLine(oldBreakpointLineNumber);
          const firstModifiedLineIsWhitespace = isWhitespace(firstModifiedLine);
          if (firstModifiedLineIsWhitespace) {
            break;
          }
          shouldDecreaseBreakpointLineNumber = false;
        } else if (oldBreakpointLineNumber === deltaEndLineNumber) {
          // Breakpoint should be removed if the last (partially) deleted line only has whitespace
          // characters remaining. Otherwise, the line number of the breakpoint should decrease by
          // the number of lines removed.
          const lastModifiedLine = editor.session
            .getLine(oldBreakpointLineNumber - deltaNumOfLinesModified)
            .substring(deltaStartColumnNumber);
          const lastModifiedLineIsWhitespace = isWhitespace(lastModifiedLine);
          if (lastModifiedLineIsWhitespace) {
            break;
          }
          shouldDecreaseBreakpointLineNumber = true;
        } else {
          // Line number of the breakpoint is decreased by the number of lines removed since the changes
          // happen on an earlier line.
          shouldDecreaseBreakpointLineNumber = true;
        }
        const newBreakpointLineNumber =
          oldBreakpointLineNumber -
          (shouldDecreaseBreakpointLineNumber ? deltaNumOfLinesModified : 0);
        newBreakpointLineNumbers.push(newBreakpointLineNumber);
        break;
      }
    }
  }

  editor.session.setBreakpoints(newBreakpointLineNumbers);
};

/**
 * Displays breakpoints on the Ace Editor instance.
 *
 * This is necessary for when the Ace Editor instance is first loaded and
 * there are breakpoints which should be displayed in the gutter.
 *
 * @param editor      The Ace Editor instance.
 * @param breakpoints The breakpoints to be set on the Ace Editor instance.
 */
const displayBreakpoints = (editor: IAceEditor, breakpoints: string[]) => {
  const breakpointLineNumbers = getBreakpointLineNumbers(breakpoints);
  editor.session.setBreakpoints(breakpointLineNumbers);
};

// Note: This is untestable/unused because JS-hint has been removed.
const makeHandleAnnotationChange = (session: Ace.EditSession) => () => {
  const annotations = session.getAnnotations();
  let count = 0;
  for (const anno of annotations) {
    if (anno.type === 'info') {
      anno.type = 'error';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore // Probably some undocumented type
      anno.className = 'ace_error';
      count++;
    }
  }
  if (count !== 0) {
    session.setAnnotations(annotations);
  }
};

const makeCompleter = (handlePromptAutocomplete: DispatchProps['handlePromptAutocomplete']) => ({
  getCompletions: (
    editor: Ace.Editor,
    session: Ace.EditSession,
    pos: Ace.Point,
    prefix: string,
    callback: () => void
  ) => {
    // Don't prompt if prefix starts with number
    if (prefix && /\d/.test(prefix.charAt(0))) {
      callback();
      return;
    }

    // Cursor col is insertion location i.e. last char col + 1
    handlePromptAutocomplete(pos.row + 1, pos.column, callback);
  }
});

const moveCursor = (editor: AceEditor['editor'], position: Position) => {
  editor.selection.clearSelection();
  editor.moveCursorToPosition(position);
  editor.renderer.showCursor();
  editor.renderer.scrollCursorIntoView(position, 0.5);
};

const EditorBase = React.memo((props: EditorProps & LocalStateProps) => {
  const reactAceRef: React.MutableRefObject<AceEditor | null> = React.useRef(null);
  const [filePath, setFilePath] = React.useState<string | undefined>(undefined);

  // Refs for things that technically shouldn't change... but just in case.
  const handleEditorUpdateBreakpointsRef = React.useRef(props.handleEditorUpdateBreakpoints);
  const handlePromptAutocompleteRef = React.useRef(props.handlePromptAutocomplete);

  const editor = reactAceRef.current?.editor;
  // Set edit session history when switching to another editor tab.
  if (editor !== undefined) {
    if (filePath !== props.filePath) {
      // Unfortunately, the current editor sets the mode globally.
      // The side effects make it very hard to ensure that the correct
      // mode is set for every EditSession. As such, we add this one
      // line to always propagate the mode whenever we set a new session.
      // See AceHelper#selectMode for more information.
      props.session.setMode(editor.getSession().getMode());
      editor.setSession(props.session);
      /* eslint-disable */

      // Add changeCursor event listener onto the current session.
      // In ReactAce, this event listener is only bound on component
      // mounting/creation, and hence changing sessions will need rebinding.
      // See react-ace/src/ace.tsx#263,#460 for more details. We also need to
      // ensure that event listener is only bound once to prevent memory leaks.
      // We also need to check non-documented property _eventRegistry to
      // see if the changeCursor listener event has been added yet.

      // @ts-ignore
      if (editor.getSession().selection._eventRegistry.changeCursor.length < 2) {
        editor.getSession().selection.on('changeCursor', reactAceRef.current!.onCursorChange);
      }

      /* eslint-enable */
      // Give focus to the editor tab only after switching from another tab.
      // This is necessary to prevent 'unstable_flushDiscreteUpdates' warnings.
      if (filePath !== undefined) {
        editor.focus();
      }
      setFilePath(props.filePath);
    }
  }

  React.useEffect(() => {
    handleEditorUpdateBreakpointsRef.current = props.handleEditorUpdateBreakpoints;
    handlePromptAutocompleteRef.current = props.handlePromptAutocomplete;
  }, [props.handleEditorUpdateBreakpoints, props.handlePromptAutocomplete]);

  React.useEffect(() => {
    if (editor === undefined) {
      return;
    }
    displayBreakpoints(editor, props.breakpoints);
  }, [editor, props.breakpoints]);

  // Handles input into AceEditor causing app to scroll to the top on iOS Safari
  React.useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  const [sourceChapter, sourceVariant, externalLibraryName] = [
    props.sourceChapter || Chapter.SOURCE_1,
    props.sourceVariant || Variant.DEFAULT,
    props.externalLibraryName || 'NONE'
  ];

  // this function defines the Ace language and highlighting mode for the
  // given combination of chapter, variant and external library. it CANNOT be
  // put in useEffect as it MUST be called before the mode is set on the Ace
  // editor, and use(Layout)Effect runs after that happens.
  //
  // this used to be in useMemo, but selectMode now checks if the mode is
  // already defined and doesn't do it, so it is now OK to keep calling this
  // unconditionally.
  selectMode(sourceChapter, sourceVariant, externalLibraryName);

  React.useLayoutEffect(() => {
    if (editor === undefined) {
      return;
    }
    const session = editor.getSession();
    // NOTE: Everything in this function is designed to run exactly ONCE per instance of react-ace.
    // The () => ref.current() are designed to use the latest instance only.

    // NOTE: the two `any`s below are because the Ace editor typedefs are
    // hopelessly incomplete
    editor.on(
      'gutterclick' as any,
      makeHandleGutterClick(handleEditorUpdateBreakpointsRef.current, props.editorTabIndex)
    );

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, makeHandleAnnotationChange(session));

    // Start autocompletion
    if (props.sourceChapter === Chapter.FULL_C || props.sourceChapter === Chapter.FULL_JAVA) {
      // for C, Java language, use the default autocomplete provided by ace editor
      const { textCompleter, keyWordCompleter, setCompleters } = acequire('ace/ext/language_tools');
      setCompleters([textCompleter, keyWordCompleter]);
    } else {
      acequire('ace/ext/language_tools').setCompleters([
        makeCompleter((...args) => handlePromptAutocompleteRef.current(...args))
      ]);
    }
  }, [editor, props.sourceChapter, props.editorTabIndex]);

  React.useLayoutEffect(() => {
    if (editor === undefined) {
      return;
    }
    const newCursorPosition = props.newCursorPosition;
    if (newCursorPosition) {
      moveCursor(editor, newCursorPosition);
    }
  }, [editor, props.newCursorPosition]);

  const {
    handleUpdateHasUnsavedChanges,
    handleEditorValueChange,
    isEditorAutorun,
    handleEditorEval
  } = props;
  const keyHandlers: EditorKeyBindingHandlers = {
    evaluate: handleEditorEval
  };

  const aceEditorProps: IAceEditorProps = {
    className: 'react-ace',
    editorProps: {
      $blockScrolling: Infinity
    },
    markers: React.useMemo(() => getMarkers(props.highlightedLines), [props.highlightedLines]),
    fontSize: 17,
    height: '100%',
    highlightActiveLine: false,
    mode: getModeString(sourceChapter, sourceVariant, externalLibraryName),
    theme: 'source',
    value: props.editorValue,
    width: '100%',
    setOptions: {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      fontFamily: "'Inconsolata', 'Consolas', monospace"
    },
    keyboardHandler: props.editorBinding
  };

  // Hooks must not change after an editor is instantiated, so to prevent that
  // we store the original value and always use that only
  const [hooks] = React.useState(props.hooks);
  if (hooks) {
    // Note: the following is extremely non-standard use of hooks
    // DO NOT refactor this into any form where the hook is called from a lambda
    for (const hook of hooks) {
      hook(props, aceEditorProps, keyHandlers, reactAceRef);
    }
  }

  const { onChange } = aceEditorProps;

  aceEditorProps.onChange = React.useCallback(
    (newCode: string, delta: Ace.Delta) => {
      if (!reactAceRef.current) {
        return;
      }

      shiftBreakpointsWithCode(reactAceRef.current.editor, delta);

      // Write editor state for the active editor tab to the store.
      handleEditorValueChange(props.editorTabIndex, newCode);
      handleEditorUpdateBreakpointsRef.current(
        props.editorTabIndex,
        reactAceRef.current.editor.session.getBreakpoints()
      );

      if (handleUpdateHasUnsavedChanges) {
        handleUpdateHasUnsavedChanges(true);
      }
      const annotations = reactAceRef.current.editor.getSession().getAnnotations();
      if (isEditorAutorun && annotations.length === 0) {
        handleEditorEval();
      }
      if (onChange !== undefined) {
        onChange(newCode, delta);
      }
    },
    [
      handleEditorValueChange,
      props.editorTabIndex,
      handleUpdateHasUnsavedChanges,
      isEditorAutorun,
      onChange,
      handleEditorEval
    ]
  );

  aceEditorProps.commands = objectEntries(keyHandlers)
    .filter(([_, exec]) => exec)
    .map(([name, exec]) => ({ name, bindKey: keyBindings[name], exec: exec! }));

  // Merge in .onEvent ace editor props
  // This prevents user errors such as
  // TRYING TO ADD AN ONCHANGE PROP WHICH KILLS THE ABOVE ONCHANGE.
  // **triggered**
  EventT.forEach(eventT => {
    const propFn = props[eventT];
    if (propFn) {
      /* eslint-disable */

      const currFn = aceEditorProps[eventT];
      if (!currFn) {
        // Typescript isn't smart enough to know that the types of both LHS/RHS are the same.
        // @ts-ignore
        aceEditorProps[eventT] = propFn;
      } else {
        aceEditorProps[eventT] = function (...args: any[]) {
          // Impossible to define a function which takes in the arbitrary number of correct arguments...
          // @ts-ignore
          currFn(...args);
          // @ts-ignore
          propFn(...args);
        };
      }
      /* eslint-enable */
    }
  });

  // Override the overlayPage function to add an id to the overlay div.
  // This allows the overlay div to be referenced and removed when the editor is unmounted.
  // See https://github.com/source-academy/frontend/pull/2832
  acequire('ace/ext/menu_tools/overlay_page').overlayPage = function (
    editor: any,
    contentElement: HTMLElement,
    callback: any
  ) {
    let closer: HTMLElement | null = document.createElement('div');
    // Add id to the overlay div
    closer.id = 'overlay';
    let ignoreFocusOut = false;

    function documentEscListener(e: KeyboardEvent) {
      if (e.keyCode === 27) {
        close();
      }
    }

    function close() {
      if (!closer) return;
      document.removeEventListener('keydown', documentEscListener);
      closer?.parentNode?.removeChild(closer);
      if (editor) {
        editor.focus();
      }
      closer = null;
      callback?.();
    }

    /**
     * Defines whether overlay is closed when user clicks outside of it.
     *
     * @param {Boolean} ignore      If set to true overlay stays open when focus moves to another part of the editor.
     */
    function setIgnoreFocusOut(ignore: boolean) {
      ignoreFocusOut = ignore;
      if (ignore) {
        closer!.style.pointerEvents = 'none';
        contentElement.style.pointerEvents = 'auto';
      }
    }

    closer.style.cssText =
      'margin: 0; padding: 0; ' +
      'position: fixed; top:0; bottom:0; left:0; right:0;' +
      'z-index: 9990; ' +
      (editor ? 'background-color: rgba(0, 0, 0, 0.3);' : '');
    closer.addEventListener('click', function (e: Event) {
      if (!ignoreFocusOut) {
        close();
      }
    });

    // click closer if esc key is pressed
    document.addEventListener('keydown', documentEscListener);

    contentElement.addEventListener('click', function (e: Event) {
      e.stopPropagation();
    });

    closer.appendChild(contentElement);
    document.body.appendChild(closer);
    if (editor) {
      editor.blur();
    }
    return {
      close: close,
      setIgnoreFocusOut: setIgnoreFocusOut
    };
  };

  // Remove the overlay div when the editor is unmounted
  React.useEffect(() => {
    return () => {
      const div = document.getElementById('overlay');
      if (div) {
        div.parentNode?.removeChild(div);
      }
    };
  }, []);

  return (
    <Card className="Editor">
      <div className="row editor-react-ace" data-testid="Editor">
        <AceEditor {...aceEditorProps} ref={reactAceRef} />
      </div>
    </Card>
  );
});

// don't create a new list every render.
const hooks = [useHighlighting, useNavigation, useShareAce, useRefactor];

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
  const [sessions, setSessions] = React.useState<Record<string, Ace.EditSession>>({});

  // Create new edit session.
  const defaultMode = acequire('ace/mode/javascript').Mode();
  const defaultEditSession = createEditSession(props.editorValue, defaultMode);

  // Initialise edit session if file path has not been seen before.
  if (props.filePath !== undefined && sessions[props.filePath] === undefined) {
    setSessions({
      ...sessions,
      [props.filePath]: defaultEditSession
    });
  }

  return (
    <EditorBase
      {...props}
      session={props.filePath ? sessions[props.filePath] : defaultEditSession}
      hooks={hooks}
    />
  );
};

export default Editor;
