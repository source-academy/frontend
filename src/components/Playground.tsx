import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/github'

/**
 * A prop that is passed to the Playground
 * @property editorValue - The string content of the react-ace editor
 * @property updateCode  - A callback function for the react-ace editor's `onChange`
 */
export interface IPlaygroundProps {
  editorValue: string
  handleEditorChange: (newCode: string) => void
}

/**
 * A component representing the Playground
 */
export default class Playground extends React.Component<IPlaygroundProps, {}> {
  public render() {
    return (
      <div className="Playground">
        <h2>Playground</h2>
        <AceEditor
          height="90%"
          width="90%"
          mode="javascript"
          theme="github"
          value={this.props.editorValue}
          onChange={this.props.handleEditorChange}
        />
      </div>
    )
  }
}
