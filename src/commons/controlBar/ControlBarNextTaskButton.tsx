import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type ControlBarNextTaskButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickNext?(): any;
};

type StateProps = {
  key: string;
  currentTask: number;
  numOfTasks: number;
};

export function ControlBarNextTaskButton(props: ControlBarNextTaskButtonProps) {
  return controlButton('Next', IconNames.ARROW_RIGHT, props.onClickNext, { iconOnRight: true }, props.currentTask >= props.numOfTasks ? true : false);
}
