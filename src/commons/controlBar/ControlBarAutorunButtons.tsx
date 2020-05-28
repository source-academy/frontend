import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';
import { RunButton } from './ControlBarRunButton';

type AutorunButtonProps = DispatchProps & StateProps;

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
};

export function AutorunButtons(props: AutorunButtonProps) {
  const toggleAutorunButton = (
    <div className="Switch">
      <Switch label="" checked={props.isEditorAutorun} onChange={props.handleToggleEditorAutorun} />
    </div>
  );

  const autoRunButton = controlButton('Auto', IconNames.AUTOMATIC_UPDATES);
  const stopButton = controlButton('Stop', IconNames.STOP, props.handleInterruptEval);
  const debuggerResetButton = controlButton(
    'Stop Debugger',
    IconNames.STOP,
    props.handleDebuggerReset
  );
  const pauseButton = controlButton('Pause', IconNames.STOP, props.handleDebuggerPause);
  const resumeButton = controlButton('Resume', IconNames.CHEVRON_RIGHT, props.handleDebuggerResume);

  const runButtonGrouping = () => {
    if (props.isEditorAutorun) {
      return autoRunButton;
    }
    if (props.isRunning) {
      return stopButton;
    }
    if (props.isDebugging) {
      return null;
    }
    return <RunButton handleEditorEval={props.handleEditorEval} key="run" />;
  };

  const pauseButtonGrouping = () => {
    if (props.isRunning && !props.isDebugging) {
      return pauseButton;
    }
    if (!props.isRunning && props.isDebugging) {
      return resumeButton;
    }
    return null;
  };

  return (
    <>
      {toggleAutorunButton}
      {runButtonGrouping()}
      {pauseButtonGrouping()}
      {props.isDebugging ? debuggerResetButton : null}
    </>
  );
}
