import controlButton from '../ControlButton';

type ControlBarTaskViewButtonProps = StateProps;

type StateProps = {
  currentask: number,
  numOfTasks: number,
};

export function ControlBarTaskViewButton(props: ControlBarTaskViewButtonProps) {
  return controlButton(
    `Question ${props.currentask} of ${props.numOfTasks}`,
    null,
    null,
    {},
    true
  );
}
