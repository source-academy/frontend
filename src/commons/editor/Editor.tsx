/* eslint-disable simple-import-sort/imports */
import { Ace, require as acequire } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'js-slang/dist/editors/ace/theme/source';

import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';
import AceEditor, { IAceEditorProps, IEditorProps } from 'react-ace';
import * as AceBuilds from 'ace-builds';
import { HotKeys } from 'react-hotkeys';

import { keyBindings, KeyFunction } from './EditorHotkeys';
import { AceMouseEvent, HighlightedLines, Position } from './EditorTypes';

// =============== Hooks ===============
// TODO: Should further refactor into EditorBase + different variants.
// Ideally, hooks should be specified by the parent component instead.
import useHighlighting from './UseHighlighting';
import useNavigation from './UseNavigation';
import useRefactor from './UseRefactor';
import useShareAce from './UseShareAce';
import useTypeInference from './UseTypeInference';
import { getModeString, selectMode } from '../utils/AceHelper';
import { EditorBinding, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import { IAceEditor } from 'react-ace/lib/types';

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
  isEditorAutorun: boolean;
  sourceChapter?: Chapter;
  externalLibraryName?: string;
  sourceVariant?: Variant;
  hooks?: EditorHook[];
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
  editorBinding: EditorBinding;
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

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

const EditorBase = React.memo((props: EditorProps & LocalStateProps) => {
  const reactAceRef: React.MutableRefObject<AceEditor | null> = React.useRef(null);

  // Refs for things that technically shouldn't change... but just in case.
  const handleEditorUpdateBreakpointsRef = React.useRef(props.handleEditorUpdateBreakpoints);
  const handlePromptAutocompleteRef = React.useRef(props.handlePromptAutocomplete);

  React.useEffect(() => {
    handleEditorUpdateBreakpointsRef.current = props.handleEditorUpdateBreakpoints;
    handlePromptAutocompleteRef.current = props.handlePromptAutocomplete;
  }, [props.handleEditorUpdateBreakpoints, props.handlePromptAutocomplete]);

  React.useEffect(() => {
    const editor = reactAceRef.current?.editor;
    if (editor === undefined) {
      return;
    }
    displayBreakpoints(editor, props.breakpoints);
  }, [props.breakpoints]);

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
    if (!reactAceRef.current) {
      return;
    }
    const editor = reactAceRef.current.editor;
    const session = editor.getSession();
    // NOTE: Everything in this function is designed to run exactly ONCE per instance of react-ace.
    // The () => ref.current() are designed to use the latest instance only.

    // NOTE: the two `any`s below are because the Ace editor typedefs are
    // hopelessly incomplete
    editor.on(
      'gutterclick' as any,
      makeHandleGutterClick(
        (...args) => handleEditorUpdateBreakpointsRef.current(...args),
        props.editorTabIndex
      ) as any
    );

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, makeHandleAnnotationChange(session));

    // Start autocompletion
    acequire('ace/ext/language_tools').setCompleters([
      makeCompleter((...args) => handlePromptAutocompleteRef.current(...args))
    ]);
  }, [props.editorTabIndex]);

  React.useLayoutEffect(() => {
    if (!reactAceRef.current) {
      return;
    }
    const newCursorPosition = props.newCursorPosition;
    if (newCursorPosition) {
      moveCursor(reactAceRef.current.editor, newCursorPosition);
    }
  }, [props.newCursorPosition]);

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
      handleEditorValueChange(props.editorTabIndex, newCode);
      shiftBreakpointsWithCode(reactAceRef.current.editor, delta);
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

  aceEditorProps.commands = Object.entries(keyHandlers)
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

  return (
    <HotKeys className="Editor bp4-card bp4-elevation-0" handlers={handlers}>
      <div className="row editor-react-ace">
        <AceEditor {...aceEditorProps} ref={reactAceRef} />
      </div>
    </HotKeys>
  );
});

// don't create a new list every render.
const hooks = [useHighlighting, useNavigation, useTypeInference, useShareAce, useRefactor];

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
  const [workspaceSettings] = React.useContext(WorkspaceSettingsContext)!;

  return <EditorBase {...props} editorBinding={workspaceSettings.editorBinding} hooks={hooks} />;
};

export default Editor;
