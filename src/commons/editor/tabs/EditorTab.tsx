import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type EditorTabProps = {
  filePath: string;
  isActive: boolean;
};

const EditorTab: React.FC<EditorTabProps> = (props: EditorTabProps) => {
  const { filePath, isActive } = props;
  return (
    <Card
      className={classNames('editor-tab', {
        selected: isActive
      })}
    >
      {filePath}
    </Card>
  );
};

export default EditorTab;
