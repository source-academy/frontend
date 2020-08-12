import { EditableText } from '@blueprintjs/core';
import React from 'react';

type EditableAchievementTitleProps = {
  title: string;
  changeTitle: any;
};

function EditableAchievementTitle(props: EditableAchievementTitleProps) {
  const { title, changeTitle } = props;

  return (
    <h3>
      <EditableText placeholder={`Enter your title here`} value={title} onChange={changeTitle} />
    </h3>
  );
}

export default EditableAchievementTitle;
