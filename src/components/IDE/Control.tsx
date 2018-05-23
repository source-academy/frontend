import * as React from 'react'

import { Button, IconName, Intent } from '@blueprintjs/core'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IControlProps {
  handleEvalEditor: () => void
  handleEvalRepl: () => void
  handleClearReplOutput: () => void
  handleInterruptEval: () => void
}

class Control extends React.Component<IControlProps, {}> {
  public render() {
    const genericButton = (
      label: string,
      icon: IconName,
      handleClick = () => {},
      intent = Intent.NONE,
      notMinimal = false
    ) => (
      <Button
        onClick={handleClick}
        className={(notMinimal ? '' : 'pt-minimal') + ' col-xs-12'}
        intent={intent}
        icon={icon}
      >
        {label}
      </Button>
    )
    const runButton = genericButton('Run', 'play', this.props.handleEvalEditor)
    const stopButton = genericButton('Stop', 'stop', this.props.handleInterruptEval)
    const evalButton = genericButton('Eval', 'play', this.props.handleEvalRepl)
    const clearButton = genericButton('Clear', 'remove', this.props.handleClearReplOutput)
    return (
      <div className="row between-xs">
        <div className="col-xs-2">{runButton}</div>
        <div className="col-xs-2">{stopButton}</div>
        <div className="col-xs-4">
          <div className="row">
            <div className="col-xs-6">{evalButton}</div>
            <div className="col-xs-6">{clearButton}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Control
