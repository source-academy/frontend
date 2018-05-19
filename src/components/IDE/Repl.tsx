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
      return <Card>{toString(props.output.value)}</Card>
    case 'errors':
      return <Card>{new ParseError(props.output.errors).errorMessages}</Card>
    default:
      return <Card>''</Card>
  }
}

export default Repl
