import { NumericInput, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type Props = {
  handleChangeStepLimit?: (stepLimit: number) => void;
  handleOnBlurAutoScale?: (stepLimit: number) => void;
  stepLimit?: number;
  stepSize: number;
  key: string;
};

function ControlBarStepLimit(props: Props) {
  /**
   * Scale the odd stepLimit into the next even integer.
   * Triggered when the input box lost focus.
   */
  const onBlurAutoScale = () => {
    props.handleOnBlurAutoScale?.(Number(props.stepLimit));
  };

  return (
    <Tooltip content="Step Limit" placement={Position.TOP}>
      <NumericInput
        leftIcon={IconNames.VERTICAL_BAR_CHART_ASC}
        style={{ width: 80 }}
        min={1}
        value={props.stepLimit}
        stepSize={props.stepSize}
        onBlur={onBlurAutoScale}
        onValueChange={limit => {
          if (Number.isFinite(limit) && limit >= 1) {
            props.handleChangeStepLimit?.(limit);
          }
        }}
      />
    </Tooltip>
  );
}

export default ControlBarStepLimit;
