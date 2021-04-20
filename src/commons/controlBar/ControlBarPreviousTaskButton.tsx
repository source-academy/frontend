import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarPreviousTaskButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickPrevious?(): any;
};

type StateProps = {
  key: string;
  currentTask: number;
};

export function ControlBarPreviousTaskButton(props: ControlBarPreviousTaskButtonProps) {
  return controlButton(
    'Previous',
    IconNames.ARROW_LEFT,
    props.onClickPrevious,
    { iconOnRight: false },
    props.currentTask <= 1 ? true : false
  );
}
