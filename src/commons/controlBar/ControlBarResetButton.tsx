import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarResetButtonProps = {
  onClick?(): any;
};

export function ControlBarResetButton({ onClick }: ControlBarResetButtonProps) {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} />;
}
