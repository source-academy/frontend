import * as React from 'react'

import { Card } from '@blueprintjs/core'
import ReplInputContainer from '../../containers/IDE/ReplInputContainer'
import { InterpreterOutput, ResultOutput } from '../../reducers/states'
import { toString } from '../../slang'

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
  return (
    <div className="col-xs-12">
      {cards}
      <div className="row">
        <ReplInputContainer />
      </div>
    </div>
  )
}

const Output: React.SFC<IOutputProps> = props => (
  <Card>
    <code>{toString(props.value)}</code>
  </Card>
)

export default Repl
