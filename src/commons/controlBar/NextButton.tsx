import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';
import { ReturnToAcademyButton } from './ReturnToAcademyButton';

type NextButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickNext?(): any;
  onClickReturn?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
};

export function NextButton(props: NextButtonProps) {
  return props.questionProgress![0] === props.questionProgress![1] ? (
    <ReturnToAcademyButton onClick={props.onClickReturn} key="return_to_academy" />
  ) : (
    controlButton('Next', IconNames.ARROW_RIGHT, props.onClickNext, { iconOnRight: true })
  );
}
