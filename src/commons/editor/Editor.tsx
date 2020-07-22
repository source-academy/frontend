/* eslint-disable simple-import-sort/sort */
import { Ace, require as acequire } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'js-slang/dist/editors/ace/theme/source';

import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import { Documentation } from '../documentation/Documentation';
import { useMergedRef } from '../utils/Hooks';
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

export type EditorKeyBindingHandlers = { [name in KeyFunction]?: () => void };
export type EditorHook = (
  inProps: Readonly<EditorProps>,
  outProps: IAceEditorProps,
  keyBindings: EditorKeyBindingHandlers,
  reactAceRef: React.MutableRefObject<AceEditor | null>
) => void;

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export type EditorProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleReplValueChange?: (newCode: string) => void;
  handleReplEval?: () => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite?: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleSendReplInputToOutput?: (newOutput: string) => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
};

type StateProps = {
  breakpoints: string[];
  editorSessionId: string;
  editorValue: string;
  highlightedLines: HighlightedLines[];
  isEditorAutorun: boolean;
  newCursorPosition?: Position;
  sharedbAceInitValue?: string;
  sharedbAceIsInviting?: boolean;
  sourceChapter?: number;
  externalLibraryName?: string;
  sourceVariant?: Variant;
  hooks?: EditorHook[];
  onChangeMethod?: any; // TODO: Add to help with keystroke logging
};

const getMarkers = (
  highlightedLines: StateProps['highlightedLines']
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

const getModeString = (chapter: number, variant: Variant, library: string) =>
  `source${chapter}${variant}${library}`;

/**
 * This _modifies global state_ and defines a new Ace mode globally.
 *
 * Don't call this directly in render functions!
 */
const selectMode = (chapter: number, variant: Variant, library: string) => {
  HighlightRulesSelector(chapter, variant, library, Documentation.externalLibraries[library]);
  ModeSelector(chapter, variant, library);
};

const makeHandleGutterClick = (
  handleEditorUpdateBreakpoints: DispatchProps['handleEditorUpdateBreakpoints']
) => (e: AceMouseEvent) => {
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
  handleEditorUpdateBreakpoints(e.editor.session.getBreakpoints());
};

// Note: This is untestable/unused because JS-hint has been removed.
const makeHandleAnnotationChange = (session: Ace.EditSession) => () => {
  const annotations = session.getAnnotations();
  let count = 0;
  for (const anno of annotations) {
    if (anno.type === 'info') {
      anno.type = 'error';
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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

const EditorBase = React.forwardRef<AceEditor, EditorProps>(function EditorBase(
  props,
  forwardedRef
) {
  const reactAceRef: React.MutableRefObject<AceEditor | null> = React.useRef(null);

  // Refs for things that technically shouldn't change... but just in case.
  const handleEditorUpdateBreakpointsRef = React.useRef(props.handleEditorUpdateBreakpoints);
  const handlePromptAutocompleteRef = React.useRef(props.handlePromptAutocomplete);

  React.useEffect(() => {
    handleEditorUpdateBreakpointsRef.current = props.handleEditorUpdateBreakpoints;
    handlePromptAutocompleteRef.current = props.handlePromptAutocomplete;
  }, [props.handleEditorUpdateBreakpoints, props.handlePromptAutocomplete]);

  const [sourceChapter, sourceVariant, externalLibraryName] = [
    props.sourceChapter || 1,
    props.sourceVariant || 'default',
    props.externalLibraryName || 'NONE'
  ];

  React.useEffect(() => {
    selectMode(sourceChapter, sourceVariant, externalLibraryName);
  }, [sourceChapter, sourceVariant, externalLibraryName]);

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
      makeHandleGutterClick((...args) => handleEditorUpdateBreakpointsRef.current(...args)) as any
    );

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, makeHandleAnnotationChange(session));

    // Start autocompletion
    acequire('ace/ext/language_tools').setCompleters([
      makeCompleter((...args) => handlePromptAutocompleteRef.current(...args))
    ]);
    // This should run exactly once.
  }, [reactAceRef, handleEditorUpdateBreakpointsRef, handlePromptAutocompleteRef]);

  React.useLayoutEffect(() => {
    if (!reactAceRef.current) {
      return;
    }
    const newCursorPosition = props.newCursorPosition;
    if (newCursorPosition) {
      moveCursor(reactAceRef.current.editor, newCursorPosition);
    }
  }, [reactAceRef, props.newCursorPosition]);

  const {
    handleUpdateHasUnsavedChanges,
    handleEditorValueChange,
    isEditorAutorun,
    handleEditorEval
  } = props;
  const onChange = React.useCallback(
    (newCode: string, delta: Ace.Delta) => {
      if (!reactAceRef.current) {
        return;
      }
      if (handleUpdateHasUnsavedChanges) {
        handleUpdateHasUnsavedChanges(true);
      }
      handleEditorValueChange(newCode);
      const annotations = reactAceRef.current.editor.getSession().getAnnotations();
      if (isEditorAutorun && annotations.length === 0) {
        handleEditorEval();
      }
    },
    [
      reactAceRef,
      handleUpdateHasUnsavedChanges,
      handleEditorValueChange,
      handleEditorEval,
      isEditorAutorun
    ]
  );

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
      fontFamily: "'Inconsolata', monospace"
    },
    onChange
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

  aceEditorProps.commands = Object.entries(keyHandlers)
    .filter(([_, exec]) => exec)
    .map(([name, exec]) => ({ name, bindKey: keyBindings[name], exec: exec! }));

  return (
    <HotKeys className="Editor" handlers={handlers}>
      <div className="row editor-react-ace">
        <AceEditor
          {...aceEditorProps}
          onChange={props.onChangeMethod}
          ref={useMergedRef(reactAceRef, forwardedRef)}
        />
      </div>
    </HotKeys>
  );
});

const Editor = React.forwardRef<AceEditor, EditorProps>((props, ref) => (
  <EditorBase
    {...props}
    hooks={[useHighlighting, useNavigation, useTypeInference, useShareAce, useRefactor]}
    ref={ref}
  />
));

export default Editor;
