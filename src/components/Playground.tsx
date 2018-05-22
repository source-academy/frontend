import * as React from 'react'

import IDE from './IDE'

const Playground: React.SFC<{}> = () => {
  return (
    <div className="Playground">
      <h2>Playground</h2>
      <IDE />
    </div>
  )
}

export default Playground
