import * as React from 'react'

import { Card } from '@blueprintjs/core'
import ReplControlContainer from '../../containers/workspace/ReplControlContainer'
import ReplInputContainer from '../../containers/workspace/ReplInputContainer'
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
      <div className="repl-output-parent">
        {cards}
        <div className="repl-input-parent row">
          <ReplInputContainer />
        </div>
      </div>
    </div>
  )
}

export const Output: React.SFC<IOutputProps> = props => {
  switch (props.output.type) {
    case 'code':
      return (
        <Card>
          <pre className="codeOutput">{props.output.value}</pre>
        </Card>
      )
    case 'running':
      return (
        <Card>
          <pre className="logOutput">{props.output.consoleLogs.join('\n')}</pre>
        </Card>
      )
    case 'result':
      if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <pre className="resultOutput">{toString(props.output.value)}</pre>
          </Card>
        )
      } else {
        return (
          <Card>
            <pre className="logOutput">{props.output.consoleLogs.join('\n')}</pre>
            <pre className="resultOutput">{toString(props.output.value)}</pre>
          </Card>
        )
      }
    case 'errors':
      if (props.output.consoleLogs.length === 0) {
        return (
          <Card>
            <pre className="errorOutput">{parseError(props.output.errors)}</pre>
          </Card>
        )
      } else {
        return (
          <Card>
            <pre className="logOutput">{props.output.consoleLogs.join('\n')}</pre>
            <br />
            <pre className="errorOutput">{parseError(props.output.errors)}</pre>
          </Card>
        )
      }
    default:
      return <Card>''</Card>
  }
}

export default Repl
