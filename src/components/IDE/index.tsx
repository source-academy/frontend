import * as React from 'react'

import Resizable from 're-resizable'

import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE">
    <div className="row ide-content-parent">
      <Resizable
        className="editor-parent"
        defaultSize={{
          width: '50%',
          height: '100%'
        }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
      >
        <EditorContainer />
      </Resizable>
      <div className="repl-parent">
        <ReplContainer />
      </div>
    </div>
  </div>
)

export default IDE
