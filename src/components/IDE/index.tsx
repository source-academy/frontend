import * as React from 'react'

import ControlContainer from '../../containers/IDE/ControlContainer'
import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE">
    <div className="row">
      <div className="col-xs-12">
        <ControlContainer />
      </div>
    </div>
    <div className="row">
      <div className="col-xs-6">
        <EditorContainer />
      </div>
      <div className="col-xs-6">
        <ReplContainer />
      </div>
    </div>
  </div>
)

export default IDE
