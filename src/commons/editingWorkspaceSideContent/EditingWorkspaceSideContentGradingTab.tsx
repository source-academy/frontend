import React from 'react';

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

const GradingTab: React.FC<GradingTabProps> = props => {
  const textareaContent = (path: Array<string | number>) => {
    return (
      <TextAreaContent
        assessment={props.assessment}
        isNumber={true}
        path={path}
        processResults={limitNumberRange(0)}
        updateAssessment={props.updateAssessment}
      />
    );
  };

  return (
    <div>
      Max Xp:
      {textareaContent(props.path.concat(['maxXp']))}
    </div>
  );
};

export default GradingTab;
