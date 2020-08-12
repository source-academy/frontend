import { EditableText } from '@blueprintjs/core';
import React from 'react';

type EditableTitleProps = {
  title: string;
  changeTitle: any;
};

function EditableTitle(props: EditableTitleProps) {
  const { title, changeTitle } = props;

  return (
    <h3>
      <EditableText placeholder={`Enter your title here`} value={title} onChange={changeTitle} />
    </h3>
  );
}

export default EditableTitle;
