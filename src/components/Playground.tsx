import * as React from 'react'

import EditorContainer from '../containers/EditorContainer'
import OutputContainer from '../containers/OutputContainer'

const Playground: React.SFC<{}> = () => {
  return (
    <div className="Playground row">
      <h2>Playground</h2>
      <EditorContainer />
      <OutputContainer />
    </div>
  )
}

export default Playground
