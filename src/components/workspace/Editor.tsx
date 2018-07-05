import * as React from 'react'
import AceEditor from 'react-ace'
import { HotKeys } from 'react-hotkeys'

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
  handleEditorEval: () => void
  handleEditorValueChange: (newCode: string) => void
}

class Editor extends React.Component<IEditorProps, {}> {
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
            fontSize={14}
            height="100%"
            highlightActiveLine={false}
            mode="javascript"
            onChange={this.props.handleEditorValueChange}
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
