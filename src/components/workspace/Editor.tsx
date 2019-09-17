import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';

import 'brace/ext/searchbox';
import 'brace/mode/javascript';
import './editorTheme/source';

import { LINKS } from '../../utils/constants';
import { checkSessionIdExists } from './collabEditing/helper';
/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  breakpoints: string[];
  editorSessionId: string;
  editorValue: string;
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  sharedbAceInitValue?: string;
  sharedbAceIsInviting?: boolean;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite?: () => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  public ShareAce: any;
  public AceEditor: React.RefObject<AceEditor>;
  private onChangeMethod: (newCode: string) => void;
  private onValidateMethod: (annotations: Annotation[]) => void;

  constructor(props: IEditorProps) {
    super(props);
    this.AceEditor = React.createRef();
    this.ShareAce = null;
    this.onChangeMethod = (newCode: string) => {
      if (this.props.handleUpdateHasUnsavedChanges) {
        this.props.handleUpdateHasUnsavedChanges(true);
      }
      this.props.handleEditorValueChange(newCode);
    };
    this.onValidateMethod = (annotations: Annotation[]) => {
      if (this.props.isEditorAutorun && annotations.length === 0) {
        this.props.handleEditorEval();
      }
    };
  }

  public getBreakpoints() {
    const breakpoints = (this.AceEditor.current as any).editor.session.$breakpoints;
    const res = [];
    for (let i = 0; i < breakpoints.length; i++) {
      if (breakpoints[i] != null) {
        res.push(i);
      }
    }
    return res;
  }

  public componentDidMount() {
    if (!this.AceEditor.current) {
      return;
    }
    const editor = (this.AceEditor.current as any).editor;
    const session = editor.getSession();

    editor.on('gutterclick', this.handleGutterClick);

    // Change all info annotations to error annotations
    session.on('changeAnnotation', this.handleAnnotationChange(session));

    // Has session ID
    if (this.props.editorSessionId !== '') {
      this.handleStartCollabEditing(editor);
    }
  }

  public componentWillUnmount() {
    if (this.ShareAce !== null) {
      // Umounting... Closing websocket
      this.ShareAce.WS.close();
    }
    this.ShareAce = null;
  }

  public getMarkers = () => {
    const markerProps = [];
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
            mode="javascript"
            onChange={this.onChangeMethod}
            onValidate={this.onValidateMethod}
            theme="source"
            value={this.props.editorValue}
            width="100%"
            setOptions={{
              fontFamily: "'Inconsolata', 'Consolas', monospace"
            }}
          />
        </div>
      </HotKeys>
    );
  }

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
      WsUrl: 'wss://' + LINKS.SHAREDB_SERVER + 'ws/',
      pluginWsUrl: null,
      namespace: 'codepad'
    });
    this.ShareAce = ShareAce;
    ShareAce.on('ready', () => {
      ShareAce.add(
        editor,
        ['code'],
        [
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
    let interval: any;
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
    interval = setInterval(checkStatus, 5000);

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

export default Editor;
