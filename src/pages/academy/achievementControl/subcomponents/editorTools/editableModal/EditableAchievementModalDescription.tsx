import React from 'react';
import { EditableText } from '@blueprintjs/core';

type EditableAchievementModalDescriptionProps = {
  description: string;
  setDescription: any;
};

function EditableAchievementModalDescription(props: EditableAchievementModalDescriptionProps) {
  const { description, setDescription } = props;

  return (
    <>
      <h3>
        <EditableText
          placeholder={`Enter your description here`}
          value={description}
          onChange={setDescription}
          multiline={true}
        />
      </h3>
    </>
  );
}

export default EditableAchievementModalDescription;
