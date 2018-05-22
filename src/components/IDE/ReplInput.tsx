import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

export interface IReplInputProps {
  replValue: string
  handleReplChange: (newCode: string) => void
  handleReplEval: () => void
}

class ReplInput extends React.Component<IReplInputProps, {}> {
  public render() {
    return (
      <AceEditor
        className="repl-react-ace"
        mode="javascript"
        theme="cobalt"
        height="1px"
        width="100%"
        value={this.props.replValue}
        onChange={this.props.handleReplChange}
        commands={[
          {
            name: 'evaluate',
            bindKey: {
              win: 'Shift-Enter',
              mac: 'Shift-Enter'
            },
            exec: this.props.handleReplEval
          }
        ]}
        minLines={2}
        maxLines={20}
        fontSize={14}
        showGutter={false}
      />
    )
  }
}

export default ReplInput
