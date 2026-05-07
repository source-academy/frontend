import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarCloseButtonProps = {
  handleClose: () => void;
};

const ControlBarCloseButton: React.FC<ControlBarCloseButtonProps> = ({ handleClose }) => {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={handleClose} />;
};

export default ControlBarCloseButton;
