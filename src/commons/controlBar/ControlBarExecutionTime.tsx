import { NumericInput, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type Props = {
  handleChangeExecTime?: (execTime: number) => void;
  execTime?: number;
};

const ControlBarExecutionTime: React.FC<Props> = props => {
  return (
    <Tooltip content="Execution Time" placement={Position.TOP}>
      <NumericInput
        leftIcon={IconNames.TIME}
        style={{ width: 80 }}
        min={1000}
        value={props.execTime}
        onValueChange={props.handleChangeExecTime}
      />
    </Tooltip>
  );
};

export default ControlBarExecutionTime;
