import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarCloseButtonProps = OwnProps;

type OwnProps = {
  key: string;
  handleClose: () => void;
};

export function ControlBarCloseButton(props: ControlBarCloseButtonProps) {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={props.handleClose} />;
}
