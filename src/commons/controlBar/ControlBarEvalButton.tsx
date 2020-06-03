import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';

type ControlBarEvalButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplEval: () => void;
  handleProgramEval: (selector: any) => void;
};

type StateProps = {
  isRunning: boolean;
  key: string;
  selector: any;
};

export function ControlBarEvalButton(props: ControlBarEvalButtonProps) {
  const combineDispatchFunctions = () => {
    props.handleReplEval();
    props.handleProgramEval(props.selector);
  };

  return props.isRunning ? null : (
    <Tooltip content="...or press shift-enter in the REPL">
      {controlButton('Eval', IconNames.CODE, combineDispatchFunctions)}
    </Tooltip>
  );
}
