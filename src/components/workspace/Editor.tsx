import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from "sharedb-ace";

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
    this.get("http://localhost:4000/gists/latest", (data: IJSONData) => {
      const ShareAce = new sharedbAce(data.id, {
        WsUrl: "ws://localhost:4000/ws",
        pluginWsUrl: "ws://localhost:3108/ws",
        namespace: "codepad",
      });
      ShareAce.on('ready', () => {
        ShareAce.add(editor, ["code"], [
          // SharedbAceRWControl,
          // SharedbAceMultipleCursors
        ]);
      });
    });
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

  private get(url: string, callback: (data: IJSONData) => void){
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
        callback(JSON.parse(xmlhttp.responseText));
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
};

export default Editor;
