import * as React from 'react'

import { MCQChoice } from '../assessment/assessmentShape'

export interface IMCQChooserProps {
  choices: MCQChoice[]
}

class MCQChooser extends React.Component<IMCQChooserProps, {}> {
  public render() {
    return (
        <div className="row editor-react-ace">
          <h2> MCQQQ </h2>
        </div>
    )
  }
}

export default MCQChooser
