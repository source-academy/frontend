import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

export interface IInputProps {
  handleEvalReplInput: (newCode: string) => void
}

class ReplInput extends React.Component<IInputProps, {}> {
  public render() {
    return (
      <AceEditor
        className="col-xs-12"
        mode="javascript"
        theme="terminal"
        height="1px"
        minLines={1}
        maxLines={20}
        showGutter={false}
      />
    )
  }
}

export default ReplInput
