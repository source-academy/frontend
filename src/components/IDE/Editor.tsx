import * as React from 'react'

import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

/**
 * @property editorValue - The string content of the react-ace editor
 * @property handleEditorChange  - A callback function
 *           for the react-ace editor's `onChange`
 */
export interface IEditorProps {
  editorValue: string
  handleEditorChange: (newCode: string) => void
}

class Editor extends React.Component<IEditorProps, {}> {
  public render() {
    return (
      <AceEditor
        mode="javascript"
        theme="terminal"
        value={this.props.editorValue}
        onChange={this.props.handleEditorChange}
        width="100%"
        fontSize={14}
      />
    )
  }
}

export default Editor
