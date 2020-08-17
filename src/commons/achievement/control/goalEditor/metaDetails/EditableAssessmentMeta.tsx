import { EditableText, NumericInput, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { AssessmentMeta, GoalMeta } from 'src/features/achievement/AchievementTypes';

type EditableAssessmentMetaProps = {
  changeMeta: (meta: GoalMeta) => void;
  meta: GoalMeta;
};

function EditableAssessmentMeta(props: EditableAssessmentMetaProps) {
  const { changeMeta, meta } = props;

  const assessmentMeta = meta as AssessmentMeta;
  const { assessmentNumber, requiredCompletionFrac } = assessmentMeta;

  const handleChangeAssessmentNumber = (assessmentNumber: string) =>
    changeMeta({ ...assessmentMeta, assessmentNumber: assessmentNumber });

  const handleChangeRequiredCompletion = (requiredCompletion: number) => {
    const requiredCompletionFrac = requiredCompletion / 100;
    changeMeta({ ...assessmentMeta, requiredCompletionFrac: requiredCompletionFrac });
  };

  return (
    <>
      <Tooltip content="Assessment Number">
        <EditableText
          onChange={handleChangeAssessmentNumber}
          placeholder="Enter assessment number here"
          value={assessmentNumber}
        />
      </Tooltip>
      <Tooltip content="Required Completion Percentage">
        <NumericInput
          allowNumericCharactersOnly={true}
          max={100}
          min={0}
          onValueChange={handleChangeRequiredCompletion}
          placeholder="Enter required completion percentage here"
          rightElement={<p>%</p>}
          value={requiredCompletionFrac * 100}
        />
      </Tooltip>
    </>
  );
}

export default EditableAssessmentMeta;
