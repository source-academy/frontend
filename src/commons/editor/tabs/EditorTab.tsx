import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import clsx from 'clsx';
import React from 'react';

type Props = {
  filePath: string;
  isActive: boolean;
  setActive: () => void;
  remove: () => void;
};

const EditorTab: React.FC<Props> = ({ filePath, isActive, setActive, remove }) => {
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    // Stop the click event from propagating to the parent component.
    e.stopPropagation();
    remove();
  };

  return (
    <Card
      className={clsx('editor-tab', {
        selected: isActive
      })}
      onClick={setActive}
    >
      {filePath}
      <Icon className="remove-button" icon={IconNames.SMALL_CROSS} onClick={onClick} />
    </Card>
  );
};

export default EditorTab;
