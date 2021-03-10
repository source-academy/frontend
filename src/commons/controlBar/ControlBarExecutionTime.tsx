import { NumericInput, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

type ControlBarExecutionTimeProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChangeExecTime?: (execTime: number) => void;
};

type StateProps = {
  execTime?: number;
  key: string;
};

export function ControlBarExecutionTime(props: ControlBarExecutionTimeProps) {
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
}
