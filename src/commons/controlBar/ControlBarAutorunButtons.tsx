import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';
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
  sourceChapter?: number;
};

export function ControlBarAutorunButtons(props: ControlBarAutorunButtonProps) {
  const showRunButton = !props.isDebugging && (
    <ControlBarRunButton
      handleEditorEval={props.handleEditorEval}
      // Neon Green: #39FF14
      color={props.isRunning ? '#39FF14' : undefined}
      className={props.isRunning ? 'WaitingCursor' : undefined}
      key="run"
    />
  );

  const showAutoRunIndicator =
    props.isEditorAutorun && controlButton('Auto', IconNames.AUTOMATIC_UPDATES);

  // stop button does not do anything due to the blocking nature of eval methods (e.g. runInContext)
  // to prevent "flickering", we will just disable Stop Button for now
  const showStopButton = false && controlButton('Stop', IconNames.STOP, props.handleInterruptEval);

  const showDebuggerPause =
    !props.pauseDisabled &&
    props.isRunning &&
    !props.isDebugging &&
    controlButton('Pause', IconNames.STOP, props.handleDebuggerPause);

  const showDebuggerResume =
    !props.isRunning &&
    props.isDebugging &&
    controlButton('Resume', IconNames.CHEVRON_RIGHT, props.handleDebuggerResume);

  const showDebuggerReset = (label: string) =>
    props.isDebugging && controlButton(label, IconNames.STOP, props.handleDebuggerReset);

  const { isMobileBreakpoint } = useResponsive();

  return isMobileBreakpoint ? (
    <>
      {showStopButton}
      {showDebuggerPause}
      {showDebuggerResume}
      {showDebuggerReset('Stop')}
    </>
  ) : (
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
      {showAutoRunIndicator || showStopButton || showRunButton}
      {showDebuggerPause}
      {showDebuggerResume}
      {showDebuggerReset('Stop Debugger')}
    </>
  );
}
