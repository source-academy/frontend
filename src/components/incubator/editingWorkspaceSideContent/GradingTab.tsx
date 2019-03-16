import * as React from 'react';

import { IAssessment } from '../../assessment/assessmentShape';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  path: Array<string | number>;
  updateAssessment: (assessment: IAssessment) => void;
}

export class GradingTab extends React.Component<IProps, {}> {
  public constructor(props: IProps) {
    super(props);
  }

  public render() {
    return this.gradingTab();
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

export default GradingTab;