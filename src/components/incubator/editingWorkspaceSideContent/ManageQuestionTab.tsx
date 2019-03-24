import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import { mcqTemplate, programmingTemplate } from '../../incubator/assessmentTemplates';

interface IProps {
  assessment: IAssessment;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
}

export class ManageQuestionTab extends React.Component<IProps, {}> {
  public constructor(props: IProps) {
    super(props);
  }

  public render() {
    return this.manageQuestionTab();
  }

  private manageQuestionTab = () => {
    return (
      <div>
        {controlButton(
          'Insert Programming Question',
          IconNames.FONT,
          this.makeQuestion(programmingTemplate)
        )}
        {controlButton('Insert MCQ Question', IconNames.CONFIRM, this.makeQuestion(mcqTemplate))}
        {controlButton('Delete Current Question', IconNames.REMOVE, this.deleteQn)}
      </div>
    );
  };

  private makeQuestion = (template: () => any) => () => {
    const assessment = this.props.assessment;
    const index = this.props.questionId;
    let questions = assessment.questions;
    questions = questions
      .slice(0, index)
      .concat([template()])
      .concat(questions.slice(index));
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
  };

  private deleteQn = () => {
    const assessment = this.props.assessment;
    let questions = assessment.questions;
    const index = this.props.questionId;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
  };
}

export default ManageQuestionTab;
