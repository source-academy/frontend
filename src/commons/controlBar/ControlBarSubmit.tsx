import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

const ControlBarSubmit: React.FC<Props> = ({ onClick }) => {
  return (
    <ControlButton
      label="Submit"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
};

export default ControlBarSubmit;
