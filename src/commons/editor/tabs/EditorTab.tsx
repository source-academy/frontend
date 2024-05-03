import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React from 'react';

type Props = {
  filePath: string;
  isActive: boolean;
  setActive: () => void;
  remove: () => void;
  readOnly?: boolean;
};

const EditorTab: React.FC<Props> = ({ filePath, isActive, setActive, remove, readOnly }) => {
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    // Stop the click event from propagating to the parent component.
    e.stopPropagation();
    remove();
  };

  return (
    <Card
      className={classNames('editor-tab', {
        selected: isActive
      })}
      onClick={setActive}
    >
      {' '}
      {readOnly !== undefined && (
        <Icon className="file-mode-button" icon={readOnly ? IconNames.LOCK : IconNames.UNLOCK} />
      )}
      {filePath}
      <Icon className="remove-button" icon={IconNames.SMALL_CROSS} onClick={onClick} />
    </Card>
  );
};

export default EditorTab;
