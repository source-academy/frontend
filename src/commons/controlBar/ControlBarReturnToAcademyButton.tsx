import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarReturnToAcademyButtonProps = {
  onClick?(): any;
};

export function ControlBarReturnToAcademyButton({ onClick }: ControlBarReturnToAcademyButtonProps) {
  return (
    <ControlButton
      label="Return to Academy"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
}
