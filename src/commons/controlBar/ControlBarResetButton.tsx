import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarResetButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ControlBarResetButton(props: ControlBarResetButtonProps) {
  return controlButton('Reset', IconNames.REPEAT, props.onClick);
}
