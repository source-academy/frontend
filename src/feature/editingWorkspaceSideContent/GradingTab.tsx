import * as React from 'react';

import { IAssessment } from '../assessment/AssessmentTypes';
import { limitNumberRange } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './TextAreaContent';

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

  private textareaContent = (path: Array<string | number>) => {
    return (
      <TextAreaContent
        assessment={this.props.assessment}
        isNumber={true}
        path={path}
        processResults={limitNumberRange(0)}
        updateAssessment={this.props.updateAssessment}
      />
    );
  };

  private gradingTab = () => (
    <div>
      Max Grade:
      {this.textareaContent(this.props.path.concat(['maxGrade']))}
      <br />
      Max Xp:
      {this.textareaContent(this.props.path.concat(['maxXp']))}
    </div>
  );
}

export default GradingTab;
