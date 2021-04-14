import { NumericInput, Tooltip } from '@blueprintjs/core';
import { AssessmentMeta, GoalMeta } from 'src/features/achievement/AchievementTypes';

type EditableAssessmentMetaProps = {
  assessmentMeta: AssessmentMeta;
  changeMeta: (meta: GoalMeta) => void;
};

function EditableAssessmentMeta(props: EditableAssessmentMetaProps) {
  const { assessmentMeta, changeMeta } = props;
  const { assessmentNumber, requiredCompletionFrac } = assessmentMeta;

  const changeAssessmentNumber = (assessmentNumber: number) =>
    changeMeta({ ...assessmentMeta, assessmentNumber: assessmentNumber });

  const changeRequiredCompletion = (requiredCompletion: number) => {
    const requiredCompletionFrac = requiredCompletion / 100;
    changeMeta({ ...assessmentMeta, requiredCompletionFrac: requiredCompletionFrac });
  };

  return (
    <>
      <Tooltip content="Assessment Number">
        <NumericInput
          allowNumericCharactersOnly={true}
          onValueChange={changeAssessmentNumber}
          placeholder="Enter assessment number here"
          value={assessmentNumber}
        />
      </Tooltip>
      <Tooltip content="Required Completion Percentage">
        <NumericInput
          allowNumericCharactersOnly={true}
          max={100}
          min={0}
          onValueChange={changeRequiredCompletion}
          placeholder="Enter required completion percentage here"
          rightElement={<p>%</p>}
          value={requiredCompletionFrac * 100}
        />
      </Tooltip>
    </>
  );
}

export default EditableAssessmentMeta;
