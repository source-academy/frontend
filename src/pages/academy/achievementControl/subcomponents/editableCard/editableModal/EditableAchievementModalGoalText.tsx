import React from 'react';
import { EditableText } from '@blueprintjs/core';

type EditableAchievementModalGoalTextProps = {
  goalText: string;
  setGoalText: any;
};

function EditableAchievementModalGoalText(props: EditableAchievementModalGoalTextProps) {
  const { goalText, setGoalText } = props;

  return (
    <>
      <p>
        <EditableText
          placeholder={`Enter your goal text here`}
          value={goalText}
          onChange={setGoalText}
          multiline={true}
        />
      </p>
    </>
  );
}

export default EditableAchievementModalGoalText;
