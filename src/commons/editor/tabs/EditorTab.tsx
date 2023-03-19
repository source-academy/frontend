import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type EditorTabProps = {
  filePath: string;
  isActive: boolean;
  setActive: () => void;
};

const EditorTab: React.FC<EditorTabProps> = (props: EditorTabProps) => {
  const { filePath, isActive, setActive } = props;

  return (
    <Card
      className={classNames('editor-tab', {
        selected: isActive
      })}
      onClick={setActive}
    >
      {filePath}
    </Card>
  );
};

export default EditorTab;
