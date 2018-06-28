import { throttle } from 'lodash'
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
            mode="javascript"
            theme="cobalt"
            value={this.props.editorValue}
            onChange={throttle(this.props.handleEditorValueChange, 800, {
              leading: false, 
              trailing: true
            })}
            height="100%"
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
            width="100%"
            fontSize={14}
            highlightActiveLine={false}
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
