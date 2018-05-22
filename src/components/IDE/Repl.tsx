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
      <div className="repl-control-parent">
        <ReplControlContainer />
      </div>
      <div className="repl-output-parent">{cards}</div>
      <div className="repl-input-parent row">
        <ReplInputContainer />
      </div>
    </div>
  )
}

export const Output: React.SFC<IOutputProps> = props => {
  switch (props.output.type) {
    case 'code':
      return <Card>{props.output.value}</Card>
    case 'running':
      return <Card>{props.output.consoleLogs.join('\n')}</Card>
    case 'result':
      if (props.output.consoleLogs.length === 0) {
        return <Card>{toString(props.output.value)}</Card>
      } else {
        return (
          <Card>
            {[props.output.consoleLogs.join('\n'), toString(props.output.value)].join('\n')}
          </Card>
        )
      }
    case 'errors':
      if (props.output.consoleLogs.length === 0) {
        return <Card>{parseError(props.output.errors)}</Card>
      } else {
        return (
          <Card>
            {[props.output.consoleLogs.join('\n'), parseError(props.output.errors)].join('\n')}
          </Card>
        )
      }
    default:
      return <Card>''</Card>
  }
}

export default Repl
