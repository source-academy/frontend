import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  handleClose: () => void;
};

const ControlBarCloseButton: React.FC<Props> = ({ handleClose }) => {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={handleClose} />;
};

export default ControlBarCloseButton;
