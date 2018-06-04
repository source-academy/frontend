import * as React from 'react'
import { HotKeys } from 'react-hotkeys'

import WorkspaceContainer from '../containers/workspace'

const Playground: React.SFC<{}> = () => {
  return (
    <HotKeys className="Playground pt-dark" keyMap={keyMap}>
      <WorkspaceContainer />
    </HotKeys>
  )
}

const keyMap = {
  goGreen: 'h u l k'
}

export default Playground
