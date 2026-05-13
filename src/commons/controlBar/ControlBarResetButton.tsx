import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

const ControlBarResetButton: React.FC<Props> = ({ onClick }) => {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} />;
};

export default ControlBarResetButton;
