import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?: () => void;
};

const ControlBarVersionHistoryButton: React.FC<Props> = ({ onClick }) => {
  return <ControlButton label="History" icon={IconNames.HISTORY} onClick={onClick} />;
};

export default ControlBarVersionHistoryButton;
