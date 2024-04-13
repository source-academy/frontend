import { Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlButtonRunButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleEditorEval: () => void;
};

type StateProps = {
  key: string;
  isEntrypointFileDefined: boolean;
  color?: string;
  className?: string;
};

export const ControlBarRunButton: React.FC<ControlButtonRunButtonProps> = props => {
  const tooltipContent = props.isEntrypointFileDefined
    ? '...or press shift-enter in the editor'
    : 'Open a file to evaluate the program with the file as the entrypoint';
  return (
    <Tooltip content={tooltipContent} placement={Position.TOP}>
      <ControlButton
        label="Run"
        icon={IconNames.PLAY}
        onClick={props.handleEditorEval}
        options={{ iconColor: props.color, className: props.className }}
        isDisabled={!props.isEntrypointFileDefined}
      />
    </Tooltip>
  );
};
