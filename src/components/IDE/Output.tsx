import * as React from 'react'

import { TextArea } from '@blueprintjs/core'

import { InterpreterOutput, ResultOutput } from '../../reducers/states'

export interface IOutputProps {
  output: InterpreterOutput[]
}

const Output: React.SFC<IOutputProps> = props => (
  <TextArea
    value={JSON.stringify((props.output.slice(-1)[0] as ResultOutput).value)}
    disabled={true}
    className="col-xs-6"
  />
)

export default Output
