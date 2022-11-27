import { Card } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { Assessment, IMCQQuestion } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import { limitNumberRange } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './EditingWorkspaceSideContentTextAreaContent';

type MCQQuestionTemplateTabProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  questionId: number;
};

export const MCQQuestionTemplateTab: React.FC<MCQQuestionTemplateTabProps> = props => {
  const addOption = () => {
    const assessment = props.assessment;
    const questionId = props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.concat([
      {
        content: 'A',
        hint: null
      }
    ]);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    props.updateAssessment(assessment);
  };

  const delOption = () => {
    const assessment = props.assessment;
    const questionId = props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.slice(0, question.choices.length - 1);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    props.updateAssessment(assessment);
  };

  const textareaContent = (
    path: Array<string | number>,
    isNumber: boolean = false,
    range: number[] = [0]
  ) => {
    if (isNumber) {
      return (
        <TextAreaContent
          assessment={props.assessment}
          isNumber={true}
          path={path}
          processResults={limitNumberRange(range[0], range[1])}
          updateAssessment={props.updateAssessment}
        />
      );
    } else {
      return (
        <TextAreaContent
          assessment={props.assessment}
          path={path}
          updateAssessment={props.updateAssessment}
        />
      );
    }
  };

  // Render
  const questionId = props.questionId;
  const question = props.assessment!.questions[questionId] as IMCQQuestion;
  const mcqButton = question.choices.map((choice, i) => (
    <div key={i} className="mcq-option col-xs-12">
      Option {i}:{textareaContent(['questions', questionId, 'choices', i, 'content'])}
      <br />
      Hint:
      {textareaContent(['questions', questionId, 'choices', i, 'hint'])}
    </div>
  ));
  const deleteButton = controlButton('Delete Option', IconNames.REMOVE, delOption);

  return (
    <div className="MCQChooser row">
      <Card className="mcq-content-parent col-xs-12 middle-xs">
        <div className="row mcq-options-parent between-xs">
          {mcqButton}
          Solution:
          {textareaContent(['questions', questionId, 'solution'], true, [
            0,
            question.choices.length
          ])}
          <br />
          {controlButton('Add Option', IconNames.CONFIRM, addOption)}
          {question.choices.length > 0 ? deleteButton : undefined}
        </div>
      </Card>
    </div>
  );
};

export default MCQQuestionTemplateTab;
