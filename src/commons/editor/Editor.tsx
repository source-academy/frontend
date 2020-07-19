/* eslint-disable simple-import-sort/sort */
import { require as acequire } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'js-slang/dist/editors/ace/theme/source';

import {
  createContext,
  getAllOccurrencesInScope,
  getScope,
  getTypeInformation,
  hasDeclaration
} from 'js-slang';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';

import { checkSessionIdExists } from '../collabEditing/CollabEditingHelper';
import { Documentation } from '../documentation/Documentation';
import { Links } from '../utils/Constants';
import AceRange from './EditorAceRange';
import { Position } from './EditorTypes';
import { externalLibraries } from '../application/types/ExternalTypes';

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

class Editor extends React.PureComponent<EditorProps, {}> {
  public ShareAce: any;
  public AceEditor: React.RefObject<AceEditor>;
  private markerIds: number[];
  private onChangeMethod: (newCode: string) => void;
  private completer: {};

  constructor(props: EditorProps) {
    super(props);
    this.AceEditor = React.createRef();
    this.ShareAce = null;
    this.markerIds = [];
    this.onChangeMethod = (newCode: string) => {
      if (this.props.handleUpdateHasUnsavedChanges) {
        this.props.handleUpdateHasUnsavedChanges(true);
      }
      this.props.handleEditorValueChange(newCode);
      this.handleVariableHighlighting();
      const annotations = this.AceEditor.current!.editor.getSession().getAnnotations();
      if (this.props.isEditorAutorun && annotations.length === 0) {
        this.props.handleEditorEval();
      }
    };

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

  public getBreakpoints() {
    return this.AceEditor.current!.editor.session.getBreakpoints().filter(x => x != null);
  }

  public componentDidMount() {
    if (!this.AceEditor.current) {
      return;
    }
    const editor = this.AceEditor.current!.editor;
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
    editor.on('gutterclick' as any, this.handleGutterClick);

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, this.handleAnnotationChange(session));

    // Start autocompletion
    acequire('ace/ext/language_tools').setCompleters([this.completer]);

    // Has session ID
    if (this.props.editorSessionId !== '') {
      this.handleStartCollabEditing(editor);
    }

    this.handleVariableHighlighting();
  }

  public componentWillUnmount() {
    if (this.ShareAce !== null) {
      // Umounting, closing websocket
      this.ShareAce.WS.close();
    }
    this.ShareAce = null;
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
    let chapter = this.props.sourceChapter;
    let variant = this.props.sourceVariant;
    let external = this.props.externalLibraryName;
    if (chapter === undefined) {
      chapter = 1;
    }
    if (variant === undefined) {
      variant = 'default';
    }
    if (external === undefined) {
      external = 'NONE';
    }

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
            commands={[
              {
                name: 'evaluate',
                bindKey: {
                  win: 'Shift-Enter',
                  mac: 'Shift-Enter'
                },
                exec: this.props.handleEditorEval
              },
              {
                name: 'navigate',
                bindKey: {
                  win: 'Ctrl-B',
                  mac: 'Command-B'
                },
                exec: this.handleNavigate
              },
              {
                name: 'refactor',
                bindKey: {
                  win: 'Ctrl-M',
                  mac: 'Command-M'
                },
                exec: this.handleRefactor
              },
              {
                name: 'highlightScope',
                bindKey: {
                  win: 'Ctrl-Shift-H',
                  mac: 'Command-Shift-H'
                },
                exec: this.handleHighlightScope
              },
              {
                name: 'TypeInferenceDisplay',
                bindKey: {
                  win: 'Ctrl-Shift-M',
                  mac: 'Command-Shift-M'
                },
                exec: this.handleTypeInferenceDisplay
              }
            ]}
            editorProps={{
              $blockScrolling: Infinity
            }}
            ref={this.AceEditor}
            markers={this.getMarkers()}
            fontSize={17}
            height="100%"
            highlightActiveLine={false}
            mode={this.chapterNo()} // select according to props.sourceChapter
            onChange={this.onChangeMethod}
            onCursorChange={this.handleVariableHighlighting}
            theme="source"
            value={this.props.editorValue}
            width="100%"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              fontFamily: "'Inconsolata', 'Consolas', monospace"
            }}
          />
        </div>
      </HotKeys>
    );
  }

  // Used in navigating from occurence to navigation
  private moveCursor = (position: Position) => {
    this.AceEditor.current!.editor.selection.clearSelection();
    this.AceEditor.current!.editor.moveCursorToPosition(position);
    this.AceEditor.current!.editor.renderer.showCursor();
    this.AceEditor.current!.editor.renderer.scrollCursorIntoView(position, 0.5);
  };

  private handleNavigate = () => {
    const chapter = this.props.sourceChapter;
    const variantString =
      this.props.sourceVariant === 'default' ? '' : `_${this.props.sourceVariant}`;
    const pos = this.AceEditor.current!.editor.selection.getCursor();
    const token = this.AceEditor.current!.editor.session.getTokenAt(pos.row, pos.column);
    const url = Links.textbook;

    const external =
      this.props.externalLibraryName === undefined ? 'NONE' : this.props.externalLibraryName;
    const externalUrl =
      this.props.externalLibraryName === 'ALL' ? `External%20libraries` : external;
    const ext = Documentation.externalLibraries[external];

    this.props.handleDeclarationNavigate(this.AceEditor.current!.editor.getCursorPosition());

    const newPos = this.AceEditor.current!.editor.selection.getCursor();
    if (newPos.row !== pos.row || newPos.column !== pos.column) {
      return;
    }

    if (
      hasDeclaration(this.props.editorValue, createContext(chapter), {
        line: newPos.row + 1, // getCursorPosition returns 0-indexed row, function here takes in 1-indexed row
        column: newPos.column
      })
    ) {
      return;
    }

    if (ext.some((node: { caption: string }) => node.caption === (token && token.value))) {
      if (
        token !== null &&
        (/\bsupport.function\b/.test(token.type) || /\bbuiltinConsts\b/.test(token.type))
      ) {
        window.open(`${url}source/${externalUrl}/global.html#${token.value}`); // opens external library link
      }
    } else if (
      token !== null &&
      (/\bsupport.function\b/.test(token.type) || /\bbuiltinconsts\b/.test(token.type))
    ) {
      window.open(`${url}source/source_${chapter}${variantString}/global.html#${token.value}`); // opens builtn library link
    }
    if (token !== null && /\bstorage.type\b/.test(token.type)) {
      window.open(`${url}source/source_${chapter}.pdf`);
    }
  };

  private handleRefactor = () => {
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

  private handleHighlightScope = () => {
    const editor = this.AceEditor.current!.editor;
    if (!editor) {
      return;
    }
    const code = this.props.editorValue;
    const chapter = this.props.sourceChapter;
    const position = editor.getCursorPosition();

    const ranges = getScope(code, createContext(chapter), {
      line: position.row + 1,
      column: position.column
    });

    if (ranges.length !== 0) {
      ranges.forEach(range => {
        // Highlight the scope ranges
        this.markerIds.push(
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
  };

  private handleVariableHighlighting = () => {
    // using Ace Editor's way of highlighting as seen here: https://github.com/ajaxorg/ace/blob/master/lib/ace/editor.js#L497
    // We use async blocks so we don't block the browser during editing

    setTimeout(() => {
      if (!this.AceEditor || !this.AceEditor.current || !this.AceEditor.current.editor) {
        return;
      }
      const editor = (this.AceEditor.current as any).editor;
      const session = editor.session;
      const code = this.props.editorValue;
      const chapterNumber = this.props.sourceChapter;
      const position = editor.getCursorPosition();
      if (!session || !session.bgTokenizer) {
        return;
      }
      this.markerIds.forEach(id => {
        session.removeMarker(id);
      });
      const ranges = getAllOccurrencesInScope(code, createContext(chapterNumber), {
        line: position.row + 1,
        column: position.column
      }).map(
        loc => new AceRange(loc.start.line - 1, loc.start.column, loc.end.line - 1, loc.end.column)
      );

      const markerType = 'ace_variable_highlighting';
      const markerIds = ranges.map(range => {
        // returns the marker ID for removal later
        return session.addMarker(range, markerType, 'text');
      });
      this.markerIds = markerIds;
    }, 10);
  };

  private handleTypeInferenceDisplay = (): void => {
    const chapter = this.props.sourceChapter;
    const code = this.props.editorValue;
    const externals =
      this.props.externalLibraryName === undefined
        ? []
        : externalLibraries.get(this.props.externalLibraryName);
    const editor = this.AceEditor.current!.editor;
    const pos = editor.getCursorPosition();
    const token = editor.session.getTokenAt(pos.row, pos.column);

    // comment out everyline of the inference string returned by getTypeInformation
    const commentEveryLine = (str: string) => {
      const arr = str.split('\n');
      return arr
        .filter(st => st !== '')
        .map(st => '// ' + st)
        .join('\n');
    };

    let output;

    // display the information
    if (this.props.handleSendReplInputToOutput) {
      if (pos && token) {
        // if the token is a comment, ignore it
        if (token.type === 'comment') {
          return;
        }
        const str = getTypeInformation(
          code,
          createContext(chapter, 'default', externals),
          { line: pos.row + 1, column: pos.column },
          token.value
        );
        output = commentEveryLine(str);
        if (str.length === 0) {
          output = '// type information not found';
        }
      } else {
        output = '// invalid token. Please put cursor on an identifier.';
      }
      this.props.handleSendReplInputToOutput(output);
    }
  };

  private handleGutterClick = (e: any) => {
    const target = e.domEvent.target;
    if (
      target.className.indexOf('ace_gutter-cell') === -1 ||
      !e.editor.isFocused() ||
      e.clientX > 35 + target.getBoundingClientRect().left
    ) {
      return;
    }

    const row = e.getDocumentPosition().row;
    const content = e.editor.session.getLine(row);
    const breakpoints = e.editor.session.getBreakpoints(row, 0);
    if (
      breakpoints[row] === undefined &&
      content.length !== 0 &&
      !content.includes('//') &&
      !content.includes('debugger;')
    ) {
      e.editor.session.setBreakpoint(row);
    } else {
      e.editor.session.clearBreakpoint(row);
    }
    e.stop();
    this.props.handleEditorUpdateBreakpoints(e.editor.session.$breakpoints);
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

  private handleStartCollabEditing = (editor: any) => {
    const ShareAce = new sharedbAce(this.props.editorSessionId!, {
      WsUrl: 'wss://' + Links.shareDBServer + 'ws/',
      pluginWsUrl: null,
      namespace: 'codepad'
    });
    this.ShareAce = ShareAce;
    ShareAce.on('ready', () => {
      ShareAce.add(
        editor,
        ['code'],
        [
          // TODO: Removal
          // SharedbAceRWControl,
          // SharedbAceMultipleCursors
        ]
      );
      if (this.props.sharedbAceIsInviting) {
        this.props.handleEditorValueChange(this.props.sharedbAceInitValue!);
        this.props.handleFinishInvite!();
      }
    });

    // WebSocket connection status detection logic
    const WS = ShareAce.WS;
    const sessionIdNotFound = () => {
      clearInterval(interval);
      WS.close();
    };
    const cannotReachServer = () => {
      WS.reconnect();
    };
    const checkStatus = () => {
      if (this.ShareAce === null) {
        return;
      }
      checkSessionIdExists(
        this.props.editorSessionId,
        () => {},
        sessionIdNotFound,
        cannotReachServer
      );
    };
    // Checks connection status every 5sec
    const interval = setInterval(checkStatus, 5000);

    WS.addEventListener('open', (event: Event) => {
      this.props.handleSetWebsocketStatus!(1);
    });
    WS.addEventListener('close', (event: Event) => {
      this.props.handleSetWebsocketStatus!(0);
    });
  };
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

// TODO: Removal
// This interface is actually unused but ace poorly documents this feature so
// we leave this here for reference.
export interface IAutocompletionResult {
  caption: string;
  value: string;
  meta?: string;
  docHTML?: string;
  score?: number;
}

export default Editor;
