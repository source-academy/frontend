import * as React from 'react'

import { controlButton } from '../commons'

/**
 * @property handleEvalEditor  - A callback function for evaluation
 *           of the editor's content, using `slang`
 */
export interface IReplControlProps {
  handleReplEval: () => void
  handleReplOutputClear: () => void
}

class ReplControl extends React.Component<IReplControlProps, {}> {
  public render() {
    return (
      <div className="row end-xs">
        <div className="pt-control-group pt-fill">
          {controlButton('', 'code', this.props.handleReplEval)}
          {controlButton('', 'remove', this.props.handleReplOutputClear)}
        </div>
      </div>
    )
  }
}

export default ReplControl
