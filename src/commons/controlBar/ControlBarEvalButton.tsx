import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { OverallState } from '../application/ApplicationTypes';
import controlButton from '../ControlButton';

type ControlBarEvalButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleReplEval: () => void;
  handleProgramEval: (overallState: OverallState) => void;
};

type StateProps = {
  isRunning: boolean;
  key: string;
  overallState: OverallState;
};

export function ControlBarEvalButton(props: ControlBarEvalButtonProps) {
  
  const combineDispatchFunctions = () => {
    props.handleReplEval();
    props.handleProgramEval(props.overallState);
  };

  return props.isRunning ? null : (
    <Tooltip content="...or press shift-enter in the REPL">
      {controlButton('Eval', IconNames.CODE, combineDispatchFunctions)}
    </Tooltip>
  );
}
