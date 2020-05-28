import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ReturnToAcademyButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
};

export function ReturnToAcademyButton(props: ReturnToAcademyButtonProps) {
  return controlButton('Return to Academy', IconNames.ARROW_RIGHT, props.onClick, {
    iconOnRight: true
  });
}
