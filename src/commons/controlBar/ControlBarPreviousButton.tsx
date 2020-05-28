import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarPreviousButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
};

export function ControlBarPreviousButton(props: ControlBarPreviousButtonProps) {
  return props.questionProgress![0] <= 1
    ? null
    : controlButton('Previous', IconNames.ARROW_LEFT, props.onClick);
}
