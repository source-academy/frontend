import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../../commons/ControlButton';

export type EvalButtonProps = {
  handleReplEval: () => void;
  isRunning: boolean;
  key: string;
};

export function EvalButton(props: EvalButtonProps) {
  return props.isRunning ? null : (
    <Tooltip content="...or press shift-enter in the REPL">
      {controlButton('Eval', IconNames.CODE, props.handleReplEval)}
    </Tooltip>
  );
}
