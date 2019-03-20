import * as React from 'react'
import AceEditor from 'react-ace'
import { HotKeys } from 'react-hotkeys'

import 'brace/ext/searchbox'
import 'brace/mode/javascript'
import 'brace/theme/cobalt'

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IEditorProps {
  editorValue: string
  breakpoints: string[];
  highlightedLines: number[][];
  handleEditorEval: () => void
    handleEditorValueChange: (newCode: string) => void
    handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleUpdateHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void
}

class Editor extends React.PureComponent<IEditorProps, {}> {
  private onChangeMethod: (newCode: string) => void
  private ace: any;
  constructor(props: IEditorProps) {
    super(props)
    this.ace = React.createRef();
    this.onChangeMethod = (newCode: string) => {
      if (this.props.handleUpdateHasUnsavedChanges) {
        this.props.handleUpdateHasUnsavedChanges(true)
      }
      this.props.handleEditorValueChange(newCode)
    }
  }

  public componentDidMount() {
    if (this.ace.current == undefined) return;
    const editor: any = this.ace.current.editor;
    editor.on('gutterclick', (e: any) => {
      const target = e.domEvent.target;
      if (target.className.indexOf('ace_gutter-cell') === -1
        || (!editor.isFocused())
        || (e.clientX > 35 + target.getBoundingClientRect().left)) {
        return;
      }

      const row = e.getDocumentPosition().row;
      const content = e.editor.session.getLine(row);
      const breakpoints = e.editor.session.getBreakpoints(row, 0);
      if (breakpoints[row] === undefined
        && content.length !== 0
        && !content.includes("//")
        && !content.includes("debugger;")) {
        e.editor.session.setBreakpoint(row);
      }
      else {
        e.editor.session.clearBreakpoint(row);
      }

      e.stop();
      this.props.handleEditorUpdateBreakpoints(e.editor.session.$breakpoints);
    });
  }

  public getBreakpoints() {
    const breakpoints = (this.ace.current as any).editor.session.$breakpoints;
    const res = [];
    for (let i = 0; i < breakpoints.length; i++) {
      if (breakpoints[i] != null) {
        res.push(i);
      }
    }
    return res;
  }

  public getMarkers = () => {
    const markerProps= [];
    for(const lineNum of this.props.highlightedLines) {
      markerProps.push(
        { startRow: lineNum[0],
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
      ref={this.ace}
      markers={this.getMarkers()}
      fontSize={14}
      height="100%"
      highlightActiveLine={false}
      mode="javascript"
      onChange={this.onChangeMethod}
      theme="cobalt"
      value={this.props.editorValue}
      width="100%"
      />
      </div>
      </HotKeys>
    )
  }
}

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
}

export default Editor
