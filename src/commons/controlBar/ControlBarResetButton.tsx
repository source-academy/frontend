import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

function ControlBarResetButton({ onClick }: Props) {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} />;
}

export default ControlBarResetButton;
