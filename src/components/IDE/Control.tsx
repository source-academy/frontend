import * as React from 'react'

import { Button, IconName, Intent } from '@blueprintjs/core'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IControlProps {
  handleEvalEditor: () => void
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
    return genericButton('Run', 'play', this.props.handleEvalEditor)
  }
}

export default Control
