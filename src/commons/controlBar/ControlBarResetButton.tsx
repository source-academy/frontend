import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarResetButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ControlBarResetButton(props: ControlBarResetButtonProps) {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={props.onClick} />;
}
