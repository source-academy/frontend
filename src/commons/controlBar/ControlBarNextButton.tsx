import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';
import ControlBarReturnToAcademyButton from './ControlBarReturnToAcademyButton';
import ControlBarSubmit from './ControlBarSubmit';

type Props = {
  onClickNext?(): any;
  onClickReturn?(): any;
  onClickSubmit?(): any;
  key: string;
  questionProgress: [number, number] | null;
  submitOnFinish?: boolean;
};

function ControlBarNextButton(props: Props) {
  return props.questionProgress![0] === props.questionProgress![1] ? (
    props.submitOnFinish ? (
      <ControlBarSubmit onClick={props.onClickSubmit} />
    ) : (
      <ControlBarReturnToAcademyButton onClick={props.onClickReturn} key="return_to_academy" />
    )
  ) : (
    <ControlButton
      label="Next"
      icon={IconNames.ARROW_RIGHT}
      onClick={props.onClickNext}
      options={{ iconOnRight: true }}
    />
  );
}

export default ControlBarNextButton;
