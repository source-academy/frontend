import * as React from 'react'

import { Button, IconName, Intent } from '@blueprintjs/core'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IReplControlProps {
  handleEvalRepl: () => void
  handleClearReplOutput: () => void
}

class ReplControl extends React.Component<IReplControlProps, {}> {
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
    const evalButton = genericButton('Eval', 'play', this.props.handleEvalRepl)
    const clearButton = genericButton('Clear', 'remove', this.props.handleClearReplOutput)
    return (
      <div className="row end-xs">
        <div className="col-xs-6">{evalButton}</div>
        <div className="col-xs-6">{clearButton}</div>
      </div>
    )
  }
}

export default ReplControl
