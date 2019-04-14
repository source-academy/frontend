import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';

import 'brace/ext/searchbox';
import 'brace/mode/javascript';
import 'brace/theme/cobalt';

import { LINKS } from '../../utils/constants';
/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  isEditorAutorun: boolean;
  editorSessionId: string;
  editorValue: string;
  handleEditorEval: () => void;
  handleEditorValueChange: (newCode: string) => void;
  handleSetWebsocketStatus?: (websocketStatus: number) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  public ShareAce: any;
  private onChangeMethod: (newCode: string) => void;
  private onValidateMethod: (annotations: Annotation[]) => void;
  private AceEditor: React.RefObject<AceEditor>;

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

  public componentDidMount() {
    if (this.AceEditor.current !== null) {
      const editor = (this.AceEditor.current as any).editor;
      const session = editor.getSession();

      // Change all info annotations to error annotations
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

      // Has valid session ID
      if (this.props.editorSessionId !== '') {
        const ShareAce = new sharedbAce(this.props.editorSessionId!, {
          WsUrl: 'wss://' + LINKS.SHAREDB_SERVER + 'ws',
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
        });

        // WebSocket connection status detection logic
        const WS = ShareAce.WS;
        let interval: any;
        const checkStatus = () => {
          if (this.ShareAce !== null) {
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
              if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                const state = JSON.parse(xmlhttp.responseText).state;
                if (state !== true) {
                  // ID does not exist
                  clearInterval(interval);
                  WS.close();
                }
              } else if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
                // Cannot reach server
                // Force WS to check connection
                WS.reconnect();
              }
            };
            xmlhttp.open(
              'GET',
              'https://' + LINKS.SHAREDB_SERVER + 'gists/' + this.props.editorSessionId,
              true
            );
            xmlhttp.send();
          }
        };
        // Checks connection status every 5sec
        interval = setInterval(checkStatus, 5000);

        WS.addEventListener('open', (event: Event) => {
          this.props.handleSetWebsocketStatus!(1);
        });
        WS.addEventListener('close', (event: Event) => {
          this.props.handleSetWebsocketStatus!(0);
        });
      }
    }
  }

  public componentWillUnmount() {
    if (this.ShareAce !== null) {
      // Umounting... Closing websocket
      this.ShareAce.WS.close();
    }
    this.ShareAce = null;
  }

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
