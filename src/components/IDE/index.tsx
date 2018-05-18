import * as React from 'react'

import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE row">
    <EditorContainer />
    <ReplContainer />
  </div>
)

export default IDE
