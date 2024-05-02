import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/mode-javascript';
import 'js-slang/dist/editors/ace/theme/source';

import { Card } from '@blueprintjs/core';
import { Ace } from 'ace-builds';
import { isEqual } from 'lodash';
import React from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';

import {
  CodeDelta,
  Input,
  KeyboardCommand,
  SelectionRange
} from '../../features/sourceRecorder/SourceRecorderTypes';
import { EditorTabStateProps } from '../editor/Editor';
import { Position } from '../editor/EditorTypes';
import { EditorBinding } from '../WorkspaceSettingsContext';

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 * @property isEditorReadonly - Used for sourcecast only
 */
export type SourceRecorderEditorProps = DispatchProps &
  EditorStateProps &
  EditorTabStateProps &
  OwnProps;

type DispatchProps = {
  getTimerDuration?: () => number;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorValueChange: (newEditorValue: string) => void;
  handleEditorUpdateBreakpoints: (newBreakpoints: string[]) => void;
  handleRecordInput?: (input: Input) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
  onFocus?: (event: any, editor?: Ace.Editor) => void;
  onBlur?: (event: any, editor?: Ace.Editor) => void;
};

type EditorStateProps = {
  codeDeltasToApply?: CodeDelta[] | null;
  editorSessionId: string;
  isEditorAutorun: boolean;
  isEditorReadonly: boolean;
  inputToApply?: Input | null;
  isPlaying?: boolean;
  isRecording?: boolean;
  editorBinding?: EditorBinding;
};

type OwnProps = {
  setDraggableReplPosition?: () => void; // for the mobile Sourcecast Workspace
};

class SourcecastEditor extends React.PureComponent<SourceRecorderEditorProps, {}> {
  public ShareAce: any;
  public AceEditor: React.RefObject<AceEditor>;
  private onChangeMethod: (newCode: string, delta: CodeDelta) => void;
  private onCursorChange: (selecction: any) => void;
  private onSelectionChange: (selection: any) => void;

  constructor(props: SourceRecorderEditorProps) {
    super(props);
    this.AceEditor = React.createRef();
    this.ShareAce = null;
    this.onChangeMethod = (newCode: string, delta: CodeDelta) => {
      if (this.props.handleUpdateHasUnsavedChanges) {
        this.props.handleUpdateHasUnsavedChanges(true);
      }
      this.props.handleEditorValueChange(newCode);
      if (this.props.isRecording) {
        this.props.handleRecordInput!({
          type: 'codeDelta',
          time: this.props.getTimerDuration!(),
          data: delta
        });
      }
      const annotations = this.AceEditor.current!.editor.getSession().getAnnotations();
      if (this.props.isEditorAutorun && annotations.length === 0) {
        this.props.handleEditorEval();
      }
    };
    this.onCursorChange = (selection: any) => {
      if (!this.props.isRecording) {
        return;
      }
      const editorCursorPositionToBeApplied: Position = selection.getCursor();
      this.props.handleRecordInput!({
        type: 'cursorPositionChange',
        time: this.props.getTimerDuration!(),
        data: editorCursorPositionToBeApplied
      });
    };
    this.onSelectionChange = (selection: any) => {
      if (!this.props.isRecording) {
        return;
      }
      const range: SelectionRange = selection.getRange();
      const isBackwards: boolean = selection.isBackwards();
      if (!isEqual(range.start, range.end)) {
        this.props.handleRecordInput!({
          type: 'selectionRangeData',
          time: this.props.getTimerDuration!(),
          data: { range, isBackwards }
        });
      }
    };
  }

  public componentDidUpdate(prevProps: SourceRecorderEditorProps) {
    const { codeDeltasToApply, inputToApply, newCursorPosition } = this.props;

    if (codeDeltasToApply && codeDeltasToApply !== prevProps.codeDeltasToApply) {
      this.AceEditor.current!.editor.session.getDocument().applyDeltas(codeDeltasToApply);
      this.AceEditor.current!.editor.selection.clearSelection();
    }

    if (newCursorPosition && newCursorPosition !== prevProps.newCursorPosition) {
      this.moveCursor(newCursorPosition);
    }

    if (!inputToApply || inputToApply === prevProps.inputToApply) {
      return;
    }

    switch (inputToApply.type) {
      case 'codeDelta':
        this.AceEditor.current!.editor.session.getDocument().applyDelta(inputToApply.data);
        this.AceEditor.current!.editor.selection.clearSelection();
        break;
      case 'cursorPositionChange':
        this.moveCursor(inputToApply.data);
        break;
      case 'selectionRangeData':
        const { range, isBackwards } = inputToApply.data;
        this.AceEditor.current!.editor.selection.setRange(range, isBackwards);
        break;
      case 'keyboardCommand':
        const keyboardCommand = inputToApply.data;
        switch (keyboardCommand) {
          case 'run':
            this.props.handleEditorEval();
            // Popup mobile draggable repl when there is a recorded 'run' evaluation
            if (this.props.setDraggableReplPosition) {
              this.props.setDraggableReplPosition();
            }
            break;
        }
        break;
    }
  }

  public getBreakpoints() {
    return this.AceEditor.current!.editor.session.getBreakpoints().filter(x => x != null);
  }

  public componentDidMount() {
    if (!this.AceEditor || !this.AceEditor.current || !this.AceEditor.current.editor) {
      return;
    }
    const editor = this.AceEditor.current!.editor;
    const session = editor.getSession();

    editor.on('gutterclick' as any, this.handleGutterClick);

    // Change all info annotations to error annotations
    session.on('changeAnnotation' as any, this.handleAnnotationChange(session));

    const { onFocus, onBlur } = this.props;
    if (onFocus) {
      editor.on('focus', (event: Event) => onFocus(event, editor));
    }
    if (onBlur) {
      editor.on('blur', (event: Event) => onBlur(event, editor));
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

  public render() {
    return (
      <Card className="Editor">
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
              },
              {
                name: 'navigate',
                bindKey: {
                  win: 'Ctrl-B',
                  mac: 'Command-B'
                },
                exec: this.handleDeclarationNavigate
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
            onCursorChange={this.onCursorChange}
            onSelectionChange={this.onSelectionChange}
            readOnly={this.props.isEditorReadonly}
            theme="source"
            value={this.props.editorValue}
            width="100%"
            setOptions={{
              fontFamily: "'Inconsolata', 'Consolas', monospace"
            }}
            keyboardHandler={this.props.editorBinding}
          />
        </div>
      </Card>
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

  private handleEvaluate = () => {
    this.props.handleEditorEval();
    if (!this.props.isRecording) {
      return;
    }
    this.props.handleRecordInput!({
      type: 'keyboardCommand',
      time: this.props.getTimerDuration!(),
      data: KeyboardCommand.run
    });
  };

  // Used in navigating from occurence to navigation
  private moveCursor = (position: Position) => {
    this.AceEditor.current!.editor.selection.clearSelection();
    this.AceEditor.current!.editor.moveCursorToPosition(position);
    this.AceEditor.current!.editor.renderer.showCursor();
    this.AceEditor.current!.editor.renderer.scrollCursorIntoView(position, 0.5);
  };

  private handleDeclarationNavigate = () => {
    this.props.handleDeclarationNavigate(this.AceEditor.current!.editor.getCursorPosition());
  };
}

export default SourcecastEditor;
