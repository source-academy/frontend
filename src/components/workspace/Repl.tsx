import * as React from 'react'

import { Card } from '@blueprintjs/core'
import { InterpreterOutput } from '../../reducers/states'
import { parseError, toString } from '../../slang'

import ReplControl, { IReplControlProps } from './ReplControl'
import ReplInput, { IReplInputProps } from './ReplInput'

export interface IReplProps {
  output: InterpreterOutput[]
  replValue: string
  handleReplValueChange: (newCode: string) => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  handleChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

class Repl extends React.Component<IReplProps, {}> {
  private replBottom: HTMLDivElement

  public componentDidUpdate() {
    this.replBottom.scrollIntoView()
  }

  public render() {
    const cards = this.props.output.map((slice, index) => <Output output={slice} key={index} />)
    const controlProps: IReplControlProps = this.props as IReplControlProps
    const inputProps: IReplInputProps = this.props as IReplInputProps
    return (
      <div className="Repl">
        <div className="repl-control-parent">
          <ReplControl {...controlProps} />
        </div>
        <div className="repl-output-parent">
          {cards}
          <div className="repl-input-parent row pt-card pt-elevation-0">
            <ReplInput {...inputProps} />
          </div>
          <div
            ref={el => {
              this.replBottom = el as HTMLDivElement
            }}
          />
        </div>
      </div>
    )
  }
}

export interface IOutputProps {
  output: InterpreterOutput
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
