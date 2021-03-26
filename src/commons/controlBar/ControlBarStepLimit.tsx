import { NumericInput, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

type ControlBarStepLimitProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChangeStepLimit?: (stepLimit: number) => void;
};

type StateProps = {
  stepLimit?: number;
  key: string;
};

export function ControlBarStepLimit(props: ControlBarStepLimitProps) {
  return (
    <Tooltip2 content="Step Limit" placement={Position.TOP}>
      <NumericInput
        leftIcon={IconNames.VERTICAL_BAR_CHART_ASC}
        style={{ width: 80 }}
        min={500}
        max={5000}
        value={props.stepLimit}
        onValueChange={props.handleChangeStepLimit}
      />
    </Tooltip2>
  );
}
