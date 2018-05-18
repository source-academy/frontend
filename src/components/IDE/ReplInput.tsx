import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

export interface IReplInputProps {
  replValue: string
  handleEvalReplInput: (newCode: string) => void
}

class ReplInput extends React.Component<IReplInputProps, {}> {
  public render() {
    return (
      <AceEditor
        className="col-xs-12"
        mode="javascript"
        theme="terminal"
        height="1px"
        value={this.props.replValue}
        minLines={1}
        maxLines={20}
        showGutter={false}
      />
    )
  }
}

export default ReplInput
