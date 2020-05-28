import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ResetButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ResetButton(props: ResetButtonProps) {
  return controlButton('Reset', IconNames.REPEAT, props.onClick);
}
