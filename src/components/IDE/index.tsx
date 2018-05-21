import * as React from 'react'

import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE">
    <div className="row">
      <EditorContainer />
      <ReplContainer />
    </div>
  </div>
)

export default IDE
