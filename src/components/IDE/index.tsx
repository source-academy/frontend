import * as React from 'react'

import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE">
    <div className="row ide-content-parent">
      <div className="editor-parent">
        <EditorContainer />
      </div>
      <div className="repl-parent">
        <ReplContainer />
      </div>
    </div>
  </div>
)

export default IDE
