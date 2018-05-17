import * as React from 'react'

import { TextArea } from '@blueprintjs/core'

export interface IOutputProps {
  output: string[]
}

const Output: React.SFC<IOutputProps> = props => (
  <TextArea value={props.output.slice(-1)[0]} disabled={true} />
)

export default Output
