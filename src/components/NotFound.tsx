import * as React from 'react'

import { NonIdealState } from '@blueprintjs/core'

const NotFound: React.SFC<{}> = () => (
  <div className="NotFound">
    <NonIdealState title="404 Not Found" description="The requested resource cannot be found" />
  </div>
)

export default NotFound
