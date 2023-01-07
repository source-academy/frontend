import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type ControlBarPreviousButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
};

export function ControlBarPreviousButton(props: ControlBarPreviousButtonProps) {
  return props.questionProgress![0] <= 1 ? null : (
    <ControlButton label="Previous" icon={IconNames.ARROW_LEFT} onClick={props.onClick} />
  );
}
