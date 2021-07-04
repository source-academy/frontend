import * as React from 'react';

import { Assessment } from '../assessment/AssessmentTypes';
import { limitNumberRange } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './EditingWorkspaceSideContentTextAreaContent';

type GradingTabProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  path: Array<string | number>;
};

export class GradingTab extends React.Component<GradingTabProps, {}> {
  public constructor(props: GradingTabProps) {
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
      Max Xp:
      {this.textareaContent(this.props.path.concat(['maxXp']))}
    </div>
  );
}

export default GradingTab;
