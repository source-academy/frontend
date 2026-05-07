import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
  key: string;
  questionProgress: [number, number] | null;
};

const ControlBarPreviousButton: React.FC<Props> = props => {
  return props.questionProgress![0] <= 1 ? null : (
    <ControlButton label="Previous" icon={IconNames.ARROW_LEFT} onClick={props.onClick} />
  );
};

export default ControlBarPreviousButton;
