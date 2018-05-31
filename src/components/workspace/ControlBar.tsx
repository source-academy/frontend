import * as React from 'react'

import { controlButton } from '../commons'

const ControlBar: React.SFC<{}> = () => (
  <div className="ControlBar">
    <div className="ControlBar_editor pt-button-group">
      {controlButton('Run', 'code', () => {})}
      {controlButton('Run', 'code', () => {})}
    </div>
    <div className="ControlBar_repl pt-button-group">
      {controlButton('Eval', 'code', () => {})}
      {controlButton('Clear', 'code', () => {})}
    </div>
  </div>
)

export default ControlBar
