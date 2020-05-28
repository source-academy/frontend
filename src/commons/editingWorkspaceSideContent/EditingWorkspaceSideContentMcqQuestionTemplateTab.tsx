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

export class MCQQuestionTemplateTab extends React.Component<MCQQuestionTemplateTabProps, {}> {
  public constructor(props: MCQQuestionTemplateTabProps) {
    super(props);
  }

  public render() {
    return this.mcqTab();
  }

  private mcqTab = () => {
    const questionId = this.props.questionId;
    const question = this.props.assessment!.questions[questionId] as IMCQQuestion;
    const mcqButton = question.choices.map((choice, i) => (
      <div key={i} className="mcq-option col-xs-12">
        Option {i}:{this.textareaContent(['questions', questionId, 'choices', i, 'content'])}
        <br />
        Hint:
        {this.textareaContent(['questions', questionId, 'choices', i, 'hint'])}
      </div>
    ));
    const deleteButton = controlButton('Delete Option', IconNames.REMOVE, this.delOption);

    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">
            {mcqButton}
            Solution:
            {this.textareaContent(['questions', questionId, 'solution'], true, [
              0,
              question.choices.length
            ])}
            <br />
            {controlButton('Add Option', IconNames.CONFIRM, this.addOption)}
            {question.choices.length > 0 ? deleteButton : undefined}
          </div>
        </Card>
      </div>
    );
  };

  private addOption = () => {
    const assessment = this.props.assessment;
    const questionId = this.props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.concat([
      {
        content: 'A',
        hint: null
      }
    ]);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    this.props.updateAssessment(assessment);
  };

  private delOption = () => {
    const assessment = this.props.assessment;
    const questionId = this.props.questionId;
    const question = assessment!.questions[questionId] as IMCQQuestion;
    const choices = question.choices.slice(0, question.choices.length - 1);
    question.choices = choices;
    assessment!.questions[questionId] = question;
    this.props.updateAssessment(assessment);
  };

  private textareaContent = (
    path: Array<string | number>,
    isNumber: boolean = false,
    range: number[] = [0]
  ) => {
    if (isNumber) {
      return (
        <TextAreaContent
          assessment={this.props.assessment}
          isNumber={true}
          path={path}
          processResults={limitNumberRange(range[0], range[1])}
          updateAssessment={this.props.updateAssessment}
        />
      );
    } else {
      return (
        <TextAreaContent
          assessment={this.props.assessment}
          path={path}
          updateAssessment={this.props.updateAssessment}
        />
      );
    }
  };
}

export default MCQQuestionTemplateTab;
