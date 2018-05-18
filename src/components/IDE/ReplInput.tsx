import * as React from 'react'

import { EditableText } from '@blueprintjs/core'

export interface IInputProps {
  handleEvalReplInput: (newCode: string) => void
}

class ReplInput extends React.Component<IInputProps, {}> {
  public render() {
    return (
      <EditableText
        onConfirm={this.props.handleEvalReplInput}
      />
    )
  }
}

export default ReplInput
