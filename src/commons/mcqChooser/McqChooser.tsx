import { Button, Card, Intent } from '@blueprintjs/core';
import React from 'react';

import { IMCQQuestion } from '../assessment/AssessmentTypes';
import Markdown from '../Markdown';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

export type McqChooserProps = {
  mcq: IMCQQuestion;
  handleMCQSubmit: (choiceId: number) => void;
};

const McqChooser: React.FC<McqChooserProps> = ({ mcq, handleMCQSubmit }) => {
  const options = mcq.choices.map((choice, i) => {
    const isActive = i === mcq.answer;
    const hasSolution = mcq.solution !== undefined;
    const isSolution = i === mcq.solution;

    /**
     * Post-condition: the local state will be updated to store the
     * MCQ option selected, and a notification will be displayed with
     * a hint, if the question is ungraded.
     */
    const handleClick = () => {
      if (!isActive) {
        handleMCQSubmit(i);
      }
      if (!choice.hint || !hasSolution) {
        return;
      }

      const hintElement = <Markdown className="markdown-notification" content={choice.hint} />;
      if (isSolution) {
        showSuccessMessage(hintElement, 4000);
      } else {
        showWarningMessage(hintElement, 4000);
      }
    };

    return (
      <Button
        key={i}
        className="mcq-option col-xs-12"
        active={isActive}
        intent={
          isActive && hasSolution ? (isSolution ? Intent.SUCCESS : Intent.DANGER) : Intent.NONE
        }
        onClick={handleClick}
        minimal
      >
        <Markdown content={choice.content} />
      </Button>
    );
  });
  return (
    <div className="MCQChooser row" data-testid="MCQChooser">
      <Card className="mcq-content-parent col-xs-12 middle-xs">
        <div className="row mcq-options-parent between-xs">{options}</div>
      </Card>
    </div>
  );
};

export default McqChooser;
