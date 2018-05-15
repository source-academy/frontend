import * as React from 'react'
import AceEditor from 'react-ace'

export interface IPlaygroundProps {
  editorValue: string
  updateCode: (newCode: string) => void
}

export default class Playground extends React.Component<IPlaygroundProps, {}> {
  public render() {
    return (
      <div className="Playground">
        <h2>Playground</h2>
        <AceEditor
          mode="java"
          theme="github"
          value={this.props.editorValue}
          onChange={this.props.updateCode}
        />
      </div>
    )
  }
}
