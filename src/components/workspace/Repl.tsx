import { Card } from '@blueprintjs/core'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import { InterpreterOutput } from '../../reducers/states'
import { parseError, toString } from '../../slang'
import ReplInput, { IReplInputProps } from './ReplInput'

export interface IReplProps {
  output: InterpreterOutput[]
  replValue: string
  handleReplEval: () => void
  handleReplValueChange: (newCode: string) => void
}

export interface IOutputProps {
  output: InterpreterOutput
}

class Repl extends React.Component<IReplProps, {}> {
  private replBottom: HTMLDivElement

  public componentDidUpdate() {
    if (this.replBottom.clientWidth >= window.innerWidth - 50) {
      /* There is a bug where
       *   if the workspace has been resized via re-resizable such that the
       *   has disappeared off the screen, width 63
       * then
       *   calling scrollIntoView would cause the Repl to suddenly take up 100%
       *   of the screen width. This pushes the editor off-screen so that the
       *   user can no longer resize the workspace at all
       * Fix: the if condition is true when the Repl has dissapeared off-screen.
       *   (-15 to account for the scrollbar */
    } else {
      this.replBottom.scrollIntoView()
    }
  }

  public render() {
    const cards = this.props.output.map((slice, index) => <Output output={slice} key={index} />)
    const inputProps: IReplInputProps = this.props as IReplInputProps
    return (
      <div className="Repl">
        <div className="repl-output-parent">
          {cards}
          <HotKeys className="repl-input-parent row pt-card pt-elevation-0" handlers={handlers}>
            <ReplInput {...inputProps} />
          </HotKeys>
          <div ref={e => (this.replBottom = e!)} />
        </div>
      </div>
    )
  }
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

/* Override handler, so does not trigger when focus is in editor */
const handlers = {
  goGreen: () => {}
}

export default Repl
