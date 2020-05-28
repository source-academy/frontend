import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarReturnToAcademyButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ControlBarReturnToAcademyButton(props: ControlBarReturnToAcademyButtonProps) {
  return controlButton('Return to Academy', IconNames.ARROW_RIGHT, props.onClick, {
    iconOnRight: true
  });
}
