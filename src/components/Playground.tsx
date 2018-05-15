import * as React from 'react'

import AceEditor from 'react-ace'
import { IApplicationProps } from './Application'

const Playground: React.SFC<IApplicationProps> = ({ application }) => (
  <div className="Playground">
    <h2>Playground</h2>
    <AceEditor value={application.title} />
  </div>
)

export default Playground
