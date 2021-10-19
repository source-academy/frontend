import { Button, Card, Intent } from '@blueprintjs/core';
import * as React from 'react';

import { IMCQQuestion } from '../assessment/AssessmentTypes';
import Markdown from '../Markdown';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';

export type McqChooserProps = {
  mcq: IMCQQuestion;
  handleMCQSubmit: (choiceId: number) => void;
};

class McqChooser extends React.PureComponent<McqChooserProps, {}> {
  public render() {
    const options = this.props.mcq.choices.map((choice, i) => (
      <Button
        key={i}
        className="mcq-option col-xs-12"
        active={i === this.props.mcq.answer}
        intent={this.getButtonIntent(i, this.props.mcq.answer, this.props.mcq.solution)}
        onClick={this.onButtonClickFactory(i)}
        minimal={true}
      >
        <Markdown content={choice.content} />
      </Button>
    ));
    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">{options}</div>
        </Card>
      </div>
    );
  }

  /**
   * A function to generate an onClick function that causes
   * and mcq submission with a given answer id.
   *
   * Post-condition: the local state will be updated to store the
   * mcq option selected, and a notification will be displayed with
   * a hint, if the question is ungraded.
   *
   * @param i the id of the answer
   */
  private onButtonClickFactory = (i: number) => (e: any) => {
    if (i !== this.props.mcq.answer) {
      this.props.handleMCQSubmit(i);
    }
    const shouldDisplayMessage = this.props.mcq.solution !== null && this.props.mcq.choices[i].hint;
    if (shouldDisplayMessage) {
      const hintElement = (
        <Markdown className="markdown-notification" content={this.props.mcq.choices[i].hint!} />
      );
      if (i === this.props.mcq.solution) {
        showSuccessMessage(hintElement, 4000);
      } else {
        showWarningMessage(hintElement, 4000);
      }
    }
  };

  /**
   * Handles the logic for what intent an MCQ option should show up as.
   * This is dependent on the presence of an actual solution (for ungraded assessments),
   * the current selection, and whether the selected option is active.
   *
   * @param currentOption the current button key, corresponding to a choice ID
   * @param chosenOption the mcq option that is chosen in the state, i.e what should show up as "selected"
   * @param solution the solution to the mcq, if any
   */
  private getButtonIntent = (
    currentOption: number,
    chosenOption: number | null,
    solution?: number
  ): Intent => {
    const active = currentOption === chosenOption;
    const correctOptionSelected = active && solution !== undefined && currentOption === solution;
    if (solution === undefined) {
      return Intent.NONE;
    } else if (active && correctOptionSelected) {
      return Intent.SUCCESS;
    } else if (active && !correctOptionSelected) {
      return Intent.DANGER;
    } else {
      return Intent.NONE;
    }
  };
}

export default McqChooser;
