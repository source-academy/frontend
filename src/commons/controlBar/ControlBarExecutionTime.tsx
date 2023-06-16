import { NumericInput, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

type ControlBarExecutionTimeProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChangeExecTime?: (execTime: number) => void;
};

type StateProps = {
  execTime?: number;
  key: string;
};

export const ControlBarExecutionTime: React.FC<ControlBarExecutionTimeProps> = props => {
  return (
    <Tooltip2 content="Execution Time" placement={Position.TOP}>
      <NumericInput
        leftIcon={IconNames.TIME}
        style={{ width: 80 }}
        min={1000}
        value={props.execTime}
        onValueChange={props.handleChangeExecTime}
      />
    </Tooltip2>
  );
};
