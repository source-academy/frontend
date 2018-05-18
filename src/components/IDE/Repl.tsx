import * as React from 'react'

import { TextArea } from '@blueprintjs/core'

import { InterpreterOutput, ResultOutput } from '../../reducers/states'

export interface IReplProps {
  output: InterpreterOutput[]
}

const Repl: React.SFC<IReplProps> = props => (
  <TextArea
    value={JSON.stringify((props.output.slice(-1)[0] as ResultOutput).value)}
    disabled={true}
    className="col-xs-6"
  />
)

export default Repl
