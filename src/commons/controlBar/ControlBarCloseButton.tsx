import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarCloseButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleClose: () => void;
};

export function ControlBarCloseButton(props: ControlBarCloseButtonProps) {
  return controlButton('Close', IconNames.CROSS, props.handleClose);
}
