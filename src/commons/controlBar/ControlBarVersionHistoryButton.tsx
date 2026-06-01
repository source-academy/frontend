import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?: () => void;
};

function ControlBarVersionHistoryButton({ onClick }: Props) {
  return <ControlButton label="History" icon={IconNames.HISTORY} onClick={onClick} />;
}

export default ControlBarVersionHistoryButton;
