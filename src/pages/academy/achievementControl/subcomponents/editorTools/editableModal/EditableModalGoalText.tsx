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
      <EditableText
        placeholder={`Enter your goal text here`}
        value={goalText}
        onChange={setGoalText}
        multiline={true}
      />
    </>
  );
}

export default EditableModalGoalText;
