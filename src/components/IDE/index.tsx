import * as React from 'react'

import EditorContainer from '../../containers/IDE/EditorContainer'
import OutputContainer from '../../containers/IDE/OutputContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE row">
    <EditorContainer />
    <OutputContainer />
  </div>
)

export default IDE
