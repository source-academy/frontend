import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';
import { ControlBarRunButton } from './ControlBarRunButton';

type ControlBarAutorunButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDebuggerPause: () => void;
  handleDebuggerReset: () => void;
  handleDebuggerResume: () => void;
  handleEditorEval: () => void;
  handleInterruptEval: () => void;
  handleToggleEditorAutorun?: () => void;
};

type StateProps = {
  isDebugging: boolean;
  isEditorAutorun?: boolean;
  isRunning: boolean;
  key: string;
  autorunDisabled?: boolean;
  pauseDisabled?: boolean;
};

export function ControlBarAutorunButtons(props: ControlBarAutorunButtonProps) {
  return (
    <>
      {!props.autorunDisabled && (
        <div className="Switch">
          <Switch
            label=""
            checked={props.isEditorAutorun}
            onChange={props.handleToggleEditorAutorun}
          />
        </div>
      )}
      {(props.isEditorAutorun && controlButton('Auto', IconNames.AUTOMATIC_UPDATES)) ||
        (props.isRunning && controlButton('Stop', IconNames.STOP, props.handleInterruptEval)) ||
        (!props.isDebugging && (
          <ControlBarRunButton handleEditorEval={props.handleEditorEval} key="run" />
        ))}
      {(!props.pauseDisabled &&
        props.isRunning &&
        !props.isDebugging &&
        controlButton('Pause', IconNames.STOP, props.handleDebuggerPause)) ||
        (!props.isRunning &&
          props.isDebugging &&
          controlButton('Resume', IconNames.CHEVRON_RIGHT, props.handleDebuggerResume))}
      {props.isDebugging &&
        controlButton('Stop Debugger', IconNames.STOP, props.handleDebuggerReset)}
    </>
  );
}
