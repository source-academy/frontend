/* tslint-disable no-unused-vars */
import { require as acequire, Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import * as React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import { HotKeys } from 'react-hotkeys';

import { createContext, getAllOccurrencesInScope } from 'js-slang';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import 'js-slang/dist/editors/ace/theme/source';
import { Variant } from 'js-slang/dist/types';

import { Documentation } from '../documentation/Documentation';
import AceRange from './EditorAceRange';
import { AceMouseEvent, Position } from './EditorTypes';
import { defaultKeyBindings as keyBindings, KeyBinding } from './HotkeyBindings';

// =============== Mixins ===============
import WithShareAce from './WithShareAce';
import WithHighlighting from './WithHighlighting';
import WithNavigation from './WithNavigation';
import WithTypeInference from './WithTypeInference';
export type Constructor<T> = new (...args: any[]) => T;

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
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  newCursorPosition?: Position;
  sharedbAceInitValue?: string;
  sharedbAceIsInviting?: boolean;
  sourceChapter?: number;
  externalLibraryName?: string;
  sourceVariant?: Variant;
};

export class EditorBase extends React.PureComponent<EditorProps, {}> {
  public AceEditor: React.RefObject<AceEditor>;
  // HOC: These props will be injected into AceEditor on render
  // Use this to pass any values/callbacks into it.
  protected injectedRenderProps: { [key: string]: any } = {};
  private completer: {};

  constructor(props: EditorProps) {
    super(props);
    this.AceEditor = React.createRef();

    this.completer = {
      getCompletions: (editor: any, session: any, pos: any, prefix: any, callback: any) => {
        // Don't prompt if prefix starts with number
        if (prefix && /\d/.test(prefix.charAt(0))) {
          callback();
          return;
        }
        // console.log(pos); // Cursor col is insertion location i.e. last char col + 1
        this.props.handlePromptAutocomplete(pos.row + 1, pos.column, callback);
      }
    };
  }

  public get editor() {
    return this.AceEditor.current!.editor;
  }

  public getBreakpoints() {
    return this.editor.session.getBreakpoints().filter(x => x != null);
  }

  public componentDidMount() {
    if (!this.AceEditor.current) {
      return;
    }
    const editor = this.editor;
    const session = editor.getSession();

    // TODO: Removal
    /* disable error threshold incrementer

    const jshintOptions = {
      // undef: true,
      // unused: true,
      esnext: true,
      moz: true,
      devel: true,
      browser: true,
      node: true,
      laxcomma: true,
      laxbreak: true,
      lastsemic: true,
      onevar: false,
      passfail: false,
      maxerr: 1000,
      expr: true,
      multistr: true,
      globalstrict: true
    };
    session.$worker.send('setOptions', [jshintOptions]);

    */

    // NOTE: the two `any`s below are because the Ace editor typedefs are
    // hopelessly incomplete
    editor.on('gutterclick' as any, this.handleGutterClick as any);

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, this.handleAnnotationChange(session));

    // Start autocompletion
    acequire('ace/ext/language_tools').setCompleters([this.completer]);
  }

  public componentDidUpdate(prevProps: EditorProps) {
    const newCursorPosition = this.props.newCursorPosition;
    if (newCursorPosition && newCursorPosition !== prevProps.newCursorPosition) {
      this.moveCursor(newCursorPosition);
    }
  }

  public getMarkers = () => {
    const markerProps: IAceEditorProps['markers'] = [];
    for (const lineNum of this.props.highlightedLines) {
      markerProps.push({
        startRow: lineNum[0],
        startCol: 0,
        endRow: lineNum[1],
        endCol: 1,
        className: 'myMarker',
        type: 'fullLine'
      });
    }
    return markerProps;
  };

  // chapter selector used to choose the correct source mode
  public chapterNo = () => {
    let chapter = this.props.sourceChapter || 1;
    let variant = this.props.sourceVariant || 'default';
    let external = this.props.externalLibraryName || 'NONE';

    HighlightRulesSelector(chapter, variant, external, Documentation.externalLibraries[external]);
    ModeSelector(chapter, variant, external);
    return 'source' + chapter.toString() + variant + external;
  };

  public render() {
    return (
      <HotKeys className="Editor" handlers={handlers}>
        <div className="row editor-react-ace">
          <AceEditor
            className="react-ace"
            commands={this.generateKeyBindings(keyBindings)}
            editorProps={{
              $blockScrolling: Infinity
            }}
            ref={this.AceEditor}
            markers={this.getMarkers()}
            fontSize={17}
            height="100%"
            highlightActiveLine={false}
            mode={this.chapterNo()} // select according to props.sourceChapter
            onChange={this.onChange.bind(this)}
            theme="source"
            value={this.props.editorValue}
            width="100%"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              fontFamily: "'Inconsolata', 'Consolas', monospace"
            }}
            {...this.injectedRenderProps}
          />
        </div>
      </HotKeys>
    );
  }

  protected onChange(newCode: string, delta: Ace.Delta) {
    console.log('Change', newCode, delta);
    if (this.props.handleUpdateHasUnsavedChanges) {
      this.props.handleUpdateHasUnsavedChanges(true);
    }
    this.props.handleEditorValueChange(newCode);
    const annotations = this.AceEditor.current!.editor.getSession().getAnnotations();
    if (this.props.isEditorAutorun && annotations.length === 0) {
      this.props.handleEditorEval();
    }
  }

  // Used in navigating from occurence to navigation
  private moveCursor = (position: Position) => {
    this.AceEditor.current!.editor.selection.clearSelection();
    this.AceEditor.current!.editor.moveCursorToPosition(position);
    this.AceEditor.current!.editor.renderer.showCursor();
    this.AceEditor.current!.editor.renderer.scrollCursorIntoView(position, 0.5);
  };

  private generateKeyBindings = (bindings: KeyBinding[]) => {
    return bindings.map(cmd => {
      const exec = typeof cmd.exec === 'function' ? cmd.exec : this[cmd.exec];
      if (typeof exec !== 'function') {
        console.error('Editor: Command cannot be bound due to invalid exec function', cmd, this);
        throw new Error('Invalid Editor Command');
      }
      return { ...cmd, exec };
    });
  };

  // @ts-ignore. This is used by generateKeyBindings
  public handleEditorEval = () => {
    return this.props.handleEditorEval();
  };

  // @ts-ignore. This is used by generateKeyBindings
  public handleRefactor = () => {
    const editor = (this.AceEditor.current as any).editor;

    if (!editor) {
      return;
    }
    const code = this.props.editorValue;
    const chapter = this.props.sourceChapter;
    const position = editor.getCursorPosition();

    const sourceLocations = getAllOccurrencesInScope(code, createContext(chapter), {
      line: position.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
      column: position.column
    });

    const selection = editor.getSelection();
    const ranges = sourceLocations.map(
      loc => new AceRange(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
    );
    ranges.forEach(range => selection.addRange(range));
  };

  private handleGutterClick = (e: AceMouseEvent) => {
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
      // @ts-ignore: If breakpoint class not provided, it will be ace_breakpoint.
      e.editor.session.setBreakpoint(row);
    } else {
      e.editor.session.clearBreakpoint(row);
    }
    e.stop();
    this.props.handleEditorUpdateBreakpoints(e.editor.session.getBreakpoints());
  };

  private handleAnnotationChange = (session: any) => () => {
    const annotations = session.getAnnotations();
    let count = 0;
    for (const anno of annotations) {
      if (anno.type === 'info') {
        anno.type = 'error';
        anno.className = 'ace_error';
        count++;
      }
    }
    if (count !== 0) {
      session.setAnnotations(annotations);
    }
  };
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default WithTypeInference(WithNavigation(WithShareAce(WithHighlighting(EditorBase))));
