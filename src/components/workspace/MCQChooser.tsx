import { Card, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

import { MCQChoice } from '../assessment/assessmentShape'

export interface IMCQChooserProps {
  choices: MCQChoice[]
}

class MCQChooser extends React.Component<IMCQChooserProps, {}> {
  public render() {
    const options = this.props.choices.map((choice, i) => (
      <Card className="mcq-option col-xs-6">
        <Tooltip key={i} content={choice.hint}>
          { choice.content }
        </Tooltip>
      </ Card>
    ))
    return (
        <div className="MCQChooser">
          <Card className="row center-xs">
            <div className="col-xs-8">
              <div className="mcq-content-parent row center-xs ">
                <Card className="mcq-content col-xs-12">
                    IS NICE
                </ Card>
              </div>
              <div className="row mcq-options-parent center-xs">
                { options } 
              </div>
            </div>
          </Card>
        </div>
    )
  }
}

export default MCQChooser
