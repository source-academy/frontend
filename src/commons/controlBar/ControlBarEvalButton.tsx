import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  handleReplEval: () => void;
  isRunning: boolean;
};

export const ControlBarEvalButton: React.FC<Props> = ({ handleReplEval, isRunning }) => {
  return isRunning ? null : (
    <Tooltip content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={handleReplEval} />
    </Tooltip>
  );
};
