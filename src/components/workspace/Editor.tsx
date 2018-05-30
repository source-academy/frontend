import * as React from 'react'
import AceEditor from 'react-ace'

import { controlButton } from '../commons'

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
  isRunning: boolean
  handleEditorValueChange: (newCode: string) => void
  handleEditorEval: () => void
  handleInterruptEval: () => void
}

class Editor extends React.Component<IEditorProps, {}> {
  public render() {
    const runButton = this.props.isRunning
      ? null
      : controlButton('', 'play', this.props.handleEditorEval)
    const stopButton = this.props.isRunning
      ? controlButton('', 'stop', this.props.handleInterruptEval)
      : null
    return (
      <div className="Editor">
        <div className="row editor-control start-xs">
          <div className="col-xs-1">
            {runButton}
            {stopButton}
          </div>
        </div>
        <div className="row editor-react-ace">
          <AceEditor
            className="react-ace"
            mode="javascript"
            theme="cobalt"
            value={this.props.editorValue}
            onChange={this.props.handleEditorValueChange}
            width="100%"
            height="100%"
            fontSize={14}
            highlightActiveLine={false}
          />
        </div>
      </div>
    )
  }
}

export default Editor
