import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/github'

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
            height='90%'
            width='90%'
            mode="javascript"
            theme="github"
            value={this.props.editorValue}
            onChange={this.props.updateCode}
          />
      </div>
    )
  }
}
