import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../../commons/ControlButton';
import { ReturnToAcademyButton } from './returnToAcademyButton';

export type NextButtonProps = {
  key: string;
  questionProgress: [number, number] | null;
  onClickNext?(): any;
  onClickReturn?(): any;
};

export function NextButton(props: NextButtonProps) {
  return props.questionProgress![0] === props.questionProgress![1] ? (
    <ReturnToAcademyButton onClick={props.onClickReturn} key="return_to_academy" />
  ) : (
    controlButton('Next', IconNames.ARROW_RIGHT, props.onClickNext, { iconOnRight: true })
  );
}
