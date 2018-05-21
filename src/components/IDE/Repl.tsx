import * as React from 'react'

import { Card } from '@blueprintjs/core'
import ReplControlContainer from '../../containers/IDE/ReplControlContainer'
import ReplInputContainer from '../../containers/IDE/ReplInputContainer'
import { InterpreterOutput } from '../../reducers/states'
import { parseError, toString } from '../../slang'

export interface IReplProps {
  output: InterpreterOutput[]
}

export interface IOutputProps {
  output: InterpreterOutput
}

const Repl: React.SFC<IReplProps> = props => {
  const cards = props.output.map((slice, index) => <Output output={slice} key={index} />)
  return (
    <div className="Repl">
      <div className="row">
        <ReplControlContainer />
      </div>
      {cards}
      <ReplInputContainer />
    </div>
  )
}

export const Output: React.SFC<IOutputProps> = props => {
  switch (props.output.type) {
    case 'result':
      return <Card>{toString(props.output.value)}</Card>
    case 'errors':
      return <Card>{parseError(props.output.errors)}</Card>
    case 'code':
      return <Card>{props.output.value}</Card>
    default:
      return <Card>''</Card>
  }
}

export default Repl
