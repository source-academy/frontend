import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  handleClose: () => void;
};

function ControlBarCloseButton({ handleClose }: Props) {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={handleClose} />;
}

export default ControlBarCloseButton;
