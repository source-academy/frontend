/* tslint:disable */
import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';

import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/mode/javascript';
import 'brace/snippets/javascript';
import 'brace/theme/cobalt';

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  isEditorAutorun?: boolean;
  editorSessionId?: string;
  editorValue: string;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  private onChangeMethod: (newCode: string) => void;
  private onValidateMethod: (annotations: Annotation[]) => void;
  private ace: any;
  private ShareAce: any;

  constructor(props: IEditorProps) {
    super(props);
    this.ace = React.createRef();
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

  public componentDidMount() {
    // this editor is the same as the one in line 5 of index.js of sharedb-ace-example
    const editor = this.ace.current.editor;
    const session = editor.getSession();
    session.on('changeAnnotation', () => {
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
    });
    console.log('Mounting with ID: ' + this.props.editorSessionId);
    if (this.props.editorSessionId !== '') {
      console.log('In Mount, non-empty Session ID: ' + this.props.editorSessionId);
      console.log('Component mounted with id = ' + this.props.editorSessionId);

      const ShareAce = new sharedbAce(this.props.editorSessionId!, {
        WsUrl: 'wss://13.250.109.61/ws',
        pluginWsUrl: null,
        namespace: 'codepad'
      });
      this.ShareAce = ShareAce;
      (ShareAce as any).on('ready', () => {
        ShareAce.add(
          editor,
          ['code'],
          [
            // SharedbAceRWControl,
            // SharedbAceMultipleCursors
          ]
        );
      });
      const WS = ShareAce.WS;
      const handleDisconnect = () => {
        if (this.ShareAce !== null) {
          WS.reconnect();
        }
      };
      let timeoutHandle = window.setTimeout(handleDisconnect, 8000);
      WS.addEventListener('message', (event: any) => {
        if ('a' in JSON.parse(event.data)) {
          console.log('Received Ping');
          window.clearTimeout(timeoutHandle);
          timeoutHandle = window.setTimeout(handleDisconnect, 8000);
        }
      });
      WS.addEventListener('open', (event: any) => {
        console.log('Socket Opened');
        this.props.handleSetWebsocketStatus!(1);
      });
      WS.addEventListener('close', (event: any) => {
        console.log('Socket Closed');
        this.props.handleSetWebsocketStatus!(0);
      });
    }
  }

  public componentWillUnmount() {
    if (this.ShareAce !== null) {
      console.log('Umounting... Closing websocket');
      this.ShareAce.WS.close();
    }
    this.ShareAce = null;
  }

  public render() {
    console.log('Starting render: editorSessionId = ' + this.props.editorSessionId);
    console.log('Starting render: key = ' + this.props.editorSessionId);
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
            ref={this.ace}
            fontSize={14}
            height="100%"
            highlightActiveLine={false}
            mode="javascript"
            onChange={this.onChangeMethod}
            onValidate={this.onValidateMethod}
            theme="cobalt"
            value={this.props.editorValue}
            width="100%"
          />
        </div>
      </HotKeys>
    );
  }
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default Editor;
