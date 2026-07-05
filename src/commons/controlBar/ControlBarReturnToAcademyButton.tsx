import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

function ControlBarReturnToAcademyButton({ onClick }: Props) {
  return (
    <ControlButton
      label="Return to Academy"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
}

export default ControlBarReturnToAcademyButton;
