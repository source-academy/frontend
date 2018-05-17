import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/github'

/**
 * @property editorValue - The string content of the react-ace editor
 * @property updateCode  - A callback function for the react-ace editor's `onChange`
 */
export interface IEditorProps {
  editorValue: string
  handleEditorChange: (newCode: string) => void
}

class Editor extends React.Component<IEditorProps, {}> {
  public render() {
    return (
      <AceEditor
        height="90%"
        width="90%"
        mode="javascript"
        theme="github"
        value={this.props.editorValue}
        onChange={this.props.handleEditorChange}
      />
    )
  }
}

export default Editor
