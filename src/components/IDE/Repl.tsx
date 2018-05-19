import * as React from 'react'

import { Card } from '@blueprintjs/core'
import ReplInputContainer from '../../containers/IDE/ReplInputContainer'
import { InterpreterOutput } from '../../reducers/states'
import { ParseError, toString } from '../../slang'

export interface IReplProps {
  output: InterpreterOutput[]
}

export interface IOutputProps {
  output: InterpreterOutput
}

const Repl: React.SFC<IReplProps> = props => {
  let keyOutput = 0
  const cards = props.output.map(slice => <Output {...{ output: slice }} key={keyOutput++} />)
  return (
    <div className="col-xs-12">
      {cards}
      <div className="row">
        <ReplInputContainer />
      </div>
    </div>
  )
}

export const Output: React.SFC<IOutputProps> = props => {
  switch (props.output.type) {
    case 'result':
      return (
        <Card>
          <code>{toString(props.output.value)}</code>
        </Card>
      )
    case 'errors':
      return (
        <Card>
          <code>{new ParseError(props.output.errors).errorMessages}</code>
        </Card>
      )
    default:
      return (
        <Card>
          <code>''</code>
        </Card>
      )
  }
}

export default Repl
