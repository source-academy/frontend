import * as React from 'react'

import IDEContainer from '../containers/workspace'

const Playground: React.SFC<{}> = () => {
  return (
    <div className="Playground">
      <IDEContainer />
    </div>
  )
}

export default Playground
