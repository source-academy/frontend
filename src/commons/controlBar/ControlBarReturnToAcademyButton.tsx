import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarReturnToAcademyButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ControlBarReturnToAcademyButton(props: ControlBarReturnToAcademyButtonProps) {
  return (
    <ControlButton
      label="Return to Academy"
      icon={IconNames.ARROW_RIGHT}
      onClick={props.onClick}
      options={{ iconOnRight: true }}
    />
  );
}
