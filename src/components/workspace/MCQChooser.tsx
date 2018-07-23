import { Button, Card, Text, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

import { IMCQQuestion } from '../assessment/assessmentShape'

export interface IMCQChooserProps {
  chosenOption: number | null
  mcq: IMCQQuestion
  handleMCQSubmit: (choiceId: number) => void
}

type State = {
  mcqOption: number | null
}

class MCQChooser extends React.PureComponent<IMCQChooserProps, State> {
  constructor(props: IMCQChooserProps) {
    super(props)
    this.state = {
      mcqOption: props.chosenOption
    }
  }
  public render() {
    const options = this.props.mcq.choices.map((choice, i) => (
      <Button key={i} className="mcq-option col-xs-6" active={i === this.state.mcqOption} onClick={this.onButtonClickFactory(i)} >
        <Tooltip content={choice.hint}>
          <Text className="Text"> {choice.content} </Text>
        </Tooltip>
      </Button>
    ))
    return (
      <div className="MCQChooser">
        <Card className="mcq-content-parent row center-xs">
          <div className="col-xs-12">
            <div className="mcq-task-parent row center-xs ">
              <Card className="mcq-task col-xs-12" elevation={2}>
                <Text className="Text"> {this.props.mcq.content} </Text>
              </Card>
            </div>
            <div className="row mcq-options-parent center-xs">{options}</div>
          </div>
        </Card>
      </div>
    )
  }

  /**
   * A function to generate an onClick function that causes
   * and mcq submission with a given answer id.
   *
   * Post-condition: the local state will be updated to store the 
   * mcq option selected.
   *
   * @param i the id of the answer
   */
  private onButtonClickFactory = (i: number) => (e: any) => {
    this.props.handleMCQSubmit(i)
    this.setState({
      mcqOption: i
    })
  }
}

export default MCQChooser
