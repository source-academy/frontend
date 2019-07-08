import { isEqual } from 'lodash';
import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';
import 'brace/ext/searchbox';
import 'brace/mode/javascript';
import 'brace/theme/cobalt';

import { LINKS } from '../../utils/constants';
import {
  ICodeDelta,
  IInput,
  InputData,
  InputType,
  IPosition,
  ISelectionData,
  ISelectionRange,
  KeyboardCommand
} from '../sourcecast/sourcecastShape';
import { checkSessionIdExists } from './collabEditing/helper';
/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 * @property editorReadonly - Used for sourcecast only
 */
export interface IEditorProps {
  breakpoints: string[];
  codeDeltasToApply?: ICodeDelta[] | null;
  editorCursorPositionToBeApplied?: IPosition;
  editorSelectionDataToBeApplied?: ISelectionData;
  editorReadonly?: boolean;
  editorSessionId: string;
  editorValue: string;
  getTimerDuration?: () => number;
  highlightedLines: number[][];
  isEditorAutorun: boolean;
  isPlaying?: boolean;
  isRecording?: boolean;
  sharedbAceInitValue?: string;
  sharedbAceIsInviting?: boolean;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFinishInvite?: () => void;
  handleRecordEditorInput?: (input: IInput) => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  public ShareAce: any;
  public AceEditor: React.RefObject<AceEditor>;
  private onChangeMethod: (newCode: string, data: InputData) => void;
  private onValidateMethod: (annotations: Annotation[]) => void;
  private onCursorChange: (selecction: any) => void;
  private onSelectionChange: (selection: any) => void;

  constructor(props: IEditorProps) {
    super(props);
    this.AceEditor = React.createRef();
    this.ShareAce = null;
    this.onChangeMethod = (newCode: string, delta: ICodeDelta) => {
      if (this.props.handleUpdateHasUnsavedChanges) {
        this.props.handleUpdateHasUnsavedChanges(true);
      }
      this.props.handleEditorValueChange(newCode);
      if (this.props.isRecording) {
        this.props.handleRecordEditorInput!({
          type: InputType.codeDelta,
          time: this.props.getTimerDuration!(),
          data: delta
        });
      }
    };
    this.onValidateMethod = (annotations: Annotation[]) => {
      if (this.props.isEditorAutorun && annotations.length === 0) {
        this.props.handleEditorEval();
      }
    };
    this.onCursorChange = (selection: any) => {
      if (!this.props.isRecording) {
        return;
      }
      const editorCursorPositionToBeApplied: IPosition = selection.getCursor();
      this.props.handleRecordEditorInput!({
        type: InputType.cursorPositionChange,
        time: this.props.getTimerDuration!(),
        data: editorCursorPositionToBeApplied
      });
    };
    this.onSelectionChange = (selection: any) => {
      if (!this.props.isRecording) {
        return;
      }
      const range: ISelectionRange = selection.getRange();
      const isBackwards: boolean = selection.isBackwards();
      if (!isEqual(range.start, range.end)) {
        this.props.handleRecordEditorInput!({
          type: InputType.selectionRangeData,
          time: this.props.getTimerDuration!(),
          data: { range, isBackwards }
        });
      }
    };
  }

  public componentDidUpdate(prevProps: IEditorProps) {
    if (
      this.props.codeDeltasToApply &&
      this.props.codeDeltasToApply !== prevProps.codeDeltasToApply
    ) {
      (this.AceEditor.current as any).editor.session
        .getDocument()
        .applyDeltas(this.props.codeDeltasToApply);
      (this.AceEditor.current as any).editor.selection.clearSelection();
    }
    if (
      this.props.editorCursorPositionToBeApplied &&
      this.props.editorCursorPositionToBeApplied !== prevProps.editorCursorPositionToBeApplied
    ) {
      (this.AceEditor.current as any).editor.moveCursorToPosition(
        this.props.editorCursorPositionToBeApplied
      );
      (this.AceEditor.current as any).editor.renderer.$cursorLayer.showCursor();
      (this.AceEditor.current as any).editor.renderer.scrollCursorIntoView(
        this.props.editorCursorPositionToBeApplied,
        0.5
      );
    }
    if (
      this.props.editorSelectionDataToBeApplied &&
      this.props.editorSelectionDataToBeApplied !== prevProps.editorSelectionDataToBeApplied
    ) {
      const { range, isBackwards } = { ...this.props.editorSelectionDataToBeApplied };
      (this.AceEditor.current as any).editor.selection.setSelectionRange(range, isBackwards);
    }
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
                exec: this.handleEvaluate
              }
            ]}
            editorProps={{
              $blockScrolling: Infinity
            }}
            ref={this.AceEditor}
            markers={this.getMarkers()}
            fontSize={14}
            height="100%"
            highlightActiveLine={false}
            mode="javascript"
            onChange={this.onChangeMethod}
            onCursorChange={this.onCursorChange}
            onSelectionChange={this.onSelectionChange}
            onValidate={this.onValidateMethod}
            readOnly={this.props.editorReadonly ? this.props.editorReadonly : false}
            theme="cobalt"
            value={this.props.editorValue}
            width="100%"
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

  private handleEvaluate = () => {
    this.props.handleEditorEval();
    if (!this.props.isRecording) {
      return;
    }
    this.props.handleRecordEditorInput!({
      type: InputType.keyboardCommand,
      time: this.props.getTimerDuration!(),
      data: KeyboardCommand.run
    });
  };
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default Editor;
