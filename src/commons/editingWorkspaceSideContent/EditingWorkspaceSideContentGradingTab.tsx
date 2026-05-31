import type { Assessment } from '../assessment/AssessmentTypes';
import { limitNumberRange } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './EditingWorkspaceSideContentTextAreaContent';

type Props = {
  updateAssessment: (assessment: Assessment) => void;
  assessment: Assessment;
  path: Array<string | number>;
};

function GradingTab(props: Props) {
  const textareaContent = (path: Array<string | number>) => {
    return (
      <TextAreaContent
        assessment={props.assessment}
        isNumber
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
}

export default GradingTab;
