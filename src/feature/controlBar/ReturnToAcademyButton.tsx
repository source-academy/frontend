import { IconNames } from '@blueprintjs/icons';

import controlButton from '../../commons/ControlButton';

export type ReturnToAcademyButtonProps = {
  key: string;
  onClick?(): any;
};

export function ReturnToAcademyButton(props: ReturnToAcademyButtonProps) {
  return controlButton('Return to Academy', IconNames.ARROW_RIGHT, props.onClick, {
    iconOnRight: true
  });
}
