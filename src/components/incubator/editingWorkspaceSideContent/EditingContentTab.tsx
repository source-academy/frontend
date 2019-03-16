import * as React from 'react';

import { IAssessment } from '../../assessment/assessmentShape';
import { mcqTemplate, programmingTemplate } from '../../incubator/assessmentTemplates';
import {assignToPath, getValueFromPath } from './';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  path: Array<string | number>;
  type: string;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  editingAssessmentPath: string;
  fieldValue: string;
}

export class EditingContentTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      editingAssessmentPath: '',
      fieldValue: ''
    };
  }

  public render() {
    switch (this.props.type) {
      case "grading":
        return this.gradingTab();
      case "manageQuestions":
        return this.manageQuestionTab();      
      default:
        return null;
    }
  }

  private manageQuestionTab = () => {
    return (
      <div>
        <button onClick={this.makeProgramming}>Make Programming Question</button>
        <button onClick={this.makeMCQ}>Make MCQ Question</button>
        <button onClick={this.deleteQn}>Delete Question</button>
      </div>
    );
  };

  private makeProgramming = () => {
    const assessment = this.props.assessment;
    const path = [this.props.path[0]];
    const index = (path[1] as number) + 1;
    let questions = getValueFromPath(path, assessment);
    questions = questions
      .slice(0, index)
      .concat([programmingTemplate])
      .concat(questions.slice(index));
    assignToPath(path, questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private makeMCQ = () => {
    const assessment = this.props.assessment;
    const path = [this.props.path[0]];
    const index = (path[1] as number) + 1;
    let questions = getValueFromPath(path, assessment);
    questions = questions
      .slice(0, index)
      .concat([mcqTemplate])
      .concat(questions.slice(index));
    assignToPath(path, questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private deleteQn = () => {
    const assessment = this.props.assessment;
    const path = this.props.path;
    let questions = getValueFromPath([path[0]], assessment);
    const index = path[1] as number;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assignToPath([path[0]], questions, assessment);
    this.props.updateAssessment(assessment);
  };

  private textareaContent = (
    path: Array<string | number>,
    isNumber: boolean = false
  ) => {
    return (
      <TextareaContent
        assessment={this.props.assessment}
        isNumber={isNumber}
        path={path}
        updateAssessment={this.props.updateAssessment}
      />
    );
  };

  private gradingTab = () => (
    <div>
      Max Grade:
      {this.textareaContent(this.props.path.concat(['maxGrade']), true)}
      <br />
      Max Xp:
      {this.textareaContent(this.props.path.concat(['maxXp']), true)}
    </div>
  );
}

export default EditingContentTab;
