import { Button, Card, Text, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

import { IMCQQuestion } from '../assessment/assessmentShape'

export interface IMCQChooserProps {
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
      mcqOption: props.mcq.answer
    }
  }
  public render() {
    const options = this.props.mcq.choices.map((choice, i) => (
      <Button
        key={i}
        className="mcq-option col-xs-12"
        active={i === this.state.mcqOption}
        onClick={this.onButtonClickFactory(i)}
        minimal={true}
      >
        <Tooltip content={choice.hint}>
          <Text className="Text"> {choice.content} </Text>
        </Tooltip>
      </Button>
    ))
    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">{options}</div>
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
