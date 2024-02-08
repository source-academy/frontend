import { Button, Card, Intent } from '@blueprintjs/core';
import React from 'react';

import { IMCQQuestion } from '../assessment/AssessmentTypes';
import Markdown from '../Markdown';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

export type McqChooserProps = {
  mcq: IMCQQuestion;
  handleMCQSubmit: (choiceId: number) => void;
};

export const McqChooser: React.FC<McqChooserProps> = ({ mcq, handleMCQSubmit }) => {
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
  const onButtonClickFactory = (i: number) => (e: any) => {
    if (i !== mcq.answer) {
      handleMCQSubmit(i);
    }
    const shouldDisplayMessage = mcq.solution !== null && mcq.choices[i].hint;
    if (shouldDisplayMessage) {
      const hintElement = (
        <Markdown className="markdown-notification" content={mcq.choices[i].hint!} />
      );
      if (i === mcq.solution) {
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
  const getButtonIntent = (
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

  const options = mcq.choices.map((choice, i) => (
    <Button
      key={i}
      className="mcq-option col-xs-12"
      active={i === mcq.answer}
      intent={getButtonIntent(i, mcq.answer, mcq.solution)}
      onClick={onButtonClickFactory(i)}
      minimal
    >
      <Markdown content={choice.content} />
    </Button>
  ));
  return (
    <div className="MCQChooser row" data-testid="MCQChooser">
      <Card className="mcq-content-parent col-xs-12 middle-xs">
        <div className="row mcq-options-parent between-xs">{options}</div>
      </Card>
    </div>
  );
};

export default McqChooser;
