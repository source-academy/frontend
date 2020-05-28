import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';

type EvalButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplEval: () => void;
};

type StateProps = {
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
