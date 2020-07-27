import { EditableText } from '@blueprintjs/core';
import React from 'react';

type EditableAchievementTitleProps = {
  title: string;
  changeTitle: any;
};

function EditableAchievementTitle(props: EditableAchievementTitleProps) {
  const { title, changeTitle } = props;

  return (
    <div>
      <h1>
        <EditableText placeholder={`Enter your title here`} value={title} onChange={changeTitle} />
      </h1>
    </div>
  );
}

export default EditableAchievementTitle;
