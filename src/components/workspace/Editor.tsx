/* tslint:disable */
import * as ace from 'brace';
import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import { HotKeys } from 'react-hotkeys';
import sharedbAce from './sharedb-ace';

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
    const sourceCompleter = {
      getCompletions(editors, sessions, pos, prefix, callback) {
        const wordList1 = [
          'function',
          'return',
          'const',
          'let',
          'display',
          'null',
          'while',
          'for',
          'break',
          'continue',
          'if',
          'else',
          'true',
          'false',
          'array_length'
        ];
        const completerList1 = wordList1.map(word => {
          return {
            caption: word,
            value: word,
            meta: 'Source'
          };
        });
        const wordList2 = ['show', 'heart_bb', 'sail_bb', 'blank_bb', 'black_bb'];
        const completerList2 = wordList2.map(word => {
          return {
            caption: word,
            value: word,
            meta: 'Rune'
          };
        });
        const wordList3 = [
          'pair',
          'is_pair',
          'head',
          'tail',
          'is_empty_list',
          'is_list',
          'list',
          'draw_list',
          'equal',
          'length',
          'map',
          'build_list',
          'for_each',
          'list_to_string',
          'reverse',
          'append',
          'member',
          'remove',
          'remove_all',
          'filter',
          'enum_list',
          'list_ref',
          'accumulate',
          'set_head',
          'set_tail'
        ];
        const completerList3 = wordList3.map(word => {
          return {
            caption: word,
            value: word,
            meta: 'List Support'
          };
        });
        const wordList4 = [
          'stream_tail',
          'is_stream',
          'stream',
          'list_to_stream',
          'stream_to_list',
          'stream_length',
          'stream_map',
          'build_stream',
          'stream_for_each',
          'stream_reverse',
          'stream_append',
          'stream_member',
          'stream_remove',
          'stream_remove_all',
          'stream_filter',
          'enum_stream',
          'integers_from',
          'eval_stream',
          'stream_ref'
        ];
        const completerList4 = wordList4.map(word => {
          return {
            caption: word,
            value: word,
            meta: 'Stream Support'
          };
        });
        const completerList = completerList1
          .concat(completerList2)
          .concat(completerList3)
          .concat(completerList4);
        callback(null, completerList);
      }
    };
    const langTools = ace.acequire('ace/ext/language_tools');
    // Alternative:
    langTools.setCompleters([langTools.textCompleter, sourceCompleter]);
    // langTools.addCompleter([sourceCompleter]);
    // editor.completers = [sourceCompleter];
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });
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
    if (this.props.editorSessionId !== '') {
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
      ShareAce.WS.onopen = (event: any) => this.props.handleSetWebsocketStatus!(1);
      ShareAce.WS.onclose = (event: any) => this.props.handleSetWebsocketStatus!(0);
      // const checkAlive = () => {
      //   setTimeout(() => {
      //     const xmlhttp = new XMLHttpRequest();
      //     xmlhttp.onreadystatechange = () => {
      //       if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      //         console.log("Server alive");
      //       } else if(xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
      //         console.log("Error connecting to server");
      //       }
      //     };
      //     xmlhttp.open('GET', 'https://13.250.109.61/ping/', true);
      //     xmlhttp.send();
      //     if(ShareAce.WS.readyState === 1 && this.props.editorSessionId !== '') {
      //       checkAlive();
      //     }
      //   }, 5000);
      // };
      // checkAlive();
    }
  }

  public componentWillUnmount() {
    if (this.ShareAce !== null) {
      this.ShareAce.WS.close();
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
