import React from 'react';
import { EditableText } from '@blueprintjs/core';

type EditableModalGoalTextProps = {
  goalText: string;
  setGoalText: any;
};

function EditableModalGoalText(props: EditableModalGoalTextProps) {
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

export default EditableModalGoalText;
