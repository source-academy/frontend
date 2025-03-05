import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import ControlButton from '../ControlButton';
import { useFeature } from '../featureFlags/useFeature';

type Props = {
  handleReplEval: () => void;
  isRunning: boolean;
};

export const ControlBarEvalButton: React.FC<Props> = ({ handleReplEval, isRunning }) => {
  const conductorEnabled = useFeature(flagConductorEnable);
  const showEvalButton = conductorEnabled ? isRunning : !isRunning;
  return showEvalButton ? (
    <Tooltip content="...or press shift-enter in the REPL">
      <ControlButton label="Eval" icon={IconNames.CODE} onClick={handleReplEval} />
    </Tooltip>
  ) : null;
};
