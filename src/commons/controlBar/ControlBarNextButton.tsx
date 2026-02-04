import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';
import { ControlBarReturnToAcademyButton } from './ControlBarReturnToAcademyButton';
import { ControlBarSubmit } from './ControlBarSubmit';

type ControlBarNextButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickNext?(): any;
  onClickReturn?(): any;
  onClickSubmit?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
  submitOnFinish?: boolean;
};

export const ControlBarNextButton: React.FC<ControlBarNextButtonProps> = props => {
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
};
