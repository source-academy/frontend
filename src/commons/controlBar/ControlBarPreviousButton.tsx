import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type PreviousButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
};

export function PreviousButton(props: PreviousButtonProps) {
  return props.questionProgress![0] <= 1
    ? null
    : controlButton('Previous', IconNames.ARROW_LEFT, props.onClick);
}
