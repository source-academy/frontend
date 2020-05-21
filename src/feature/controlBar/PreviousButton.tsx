import { IconNames } from '@blueprintjs/icons';

import controlButton from '../../commons/ControlButton';

export type PreviousButtonProps = {
  key: string;
  questionProgress: [number, number] | null;
  onClick?(): any;
};

export function PreviousButton(props: PreviousButtonProps) {
  return props.questionProgress![0] <= 1
    ? null
    : controlButton('Previous', IconNames.ARROW_LEFT, props.onClick);
}
