import * as React from 'react'

import { Card } from '@blueprintjs/core'
import { InterpreterOutput, ResultOutput } from '../../reducers/states'

export interface IReplProps {
  output: InterpreterOutput[]
}

export interface IOutputProps {
  type: string
  value: string
}

const Repl: React.SFC<IReplProps> = props => {
  let keyOutput = 0
  const cards = props.output.map(slice => <Output {...slice as ResultOutput} key={keyOutput++} />)
  return <div>{cards}</div>
}

const Output: React.SFC<IOutputProps> = props => (
  <Card className="col-xs-6">
    <code>{props.value}</code>
  </Card>
)

export default Repl
