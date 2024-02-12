import { NumericInput, Position, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type ControlBarStepLimitProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChangeStepLimit?: (stepLimit: number) => void;
  handleOnBlurAutoScale?: (stepLimit: number) => void;
};

type StateProps = {
  stepLimit?: number;
  stepSize: number;
  key: string;
};

export const ControlBarStepLimit: React.FC<ControlBarStepLimitProps> = props => {
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
        min={500}
        max={5000}
        value={props.stepLimit}
        stepSize={props.stepSize}
        onBlur={onBlurAutoScale}
        onValueChange={props.handleChangeStepLimit}
      />
    </Tooltip>
  );
};
