import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarCloseButtonProps = {
  handleClose: () => void;
};

export function ControlBarCloseButton({ handleClose }: ControlBarCloseButtonProps) {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={handleClose} />;
}
