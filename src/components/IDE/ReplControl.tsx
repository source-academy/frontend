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
    const evalButton = genericButton('', 'code', this.props.handleEvalRepl)
    const clearButton = genericButton('', 'remove', this.props.handleClearReplOutput)
    return (
      <div className="row end-xs">
        <div className="pt-control-group pt-fill">
            {evalButton}
            {clearButton}
        </div>
      </div>
    )
  }
}

export default ReplControl
