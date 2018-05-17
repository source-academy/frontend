import * as React from 'react'

import { TextArea } from '@blueprintjs/core'

import { InterpreterOutput, ResultOutput } from '../reducers/playground'

export interface IOutputProps {
  output: InterpreterOutput[]
}

const Output: React.SFC<IOutputProps> = props => (
  <TextArea
    value={JSON.stringify((props.output.slice(-1)[0] as ResultOutput).value)}
    disabled={true}
  />
)

export default Output
