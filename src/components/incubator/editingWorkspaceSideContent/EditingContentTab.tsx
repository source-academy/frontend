import * as React from 'react';

import { IAssessment } from '../../assessment/assessmentShape';
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
      default:
        return null;
    }
  }

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
