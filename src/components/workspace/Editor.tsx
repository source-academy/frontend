// tslint:disable:no-console
import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from 'sharedb-ace';

import 'brace/ext/searchbox';
import 'brace/mode/javascript';
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
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void;
}

export interface IJSONData {
  id: number;
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  private onChangeMethod: (newCode: string) => void;
  private onValidateMethod: (annotations: Annotation[]) => void;
  private ace: any;

  constructor(props: IEditorProps) {
    super(props);
    this.ace = React.createRef();
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
    // const session = editor.getSession();
    if (this.props.editorSessionId !== '') {
      console.log('Component mounted with id = ' + this.props.editorSessionId);
      const ShareAce = new sharedbAce(this.props.editorSessionId, {
        WsUrl: 'wss://13.250.109.61/ws',
        pluginWsUrl: 'ws://localhost:3108/ws',
        namespace: 'codepad'
      });
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
    }
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
