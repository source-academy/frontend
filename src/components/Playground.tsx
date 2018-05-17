import * as React from 'react'
import EditorContainer from '../containers/EditorContainer'

const Playground: React.SFC<{}> = ()=> {
  return (
    <div className="Playground">
      <h2>Playground</h2>
      <EditorContainer />
    </div>
  )
}

export default Playground
