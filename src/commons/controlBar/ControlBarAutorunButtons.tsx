import { IconNames } from '@blueprintjs/icons';

import { useConductorEnable } from '../../features/conductor/flagConductorEnable';
import ControlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';
import ControlBarRunButton from './ControlBarRunButton';

type Props = {
  handleDebuggerPause: () => void;
  handleDebuggerReset: () => void;
  handleDebuggerResume: () => void;
  handleEditorEval: () => void;
  handleInterruptEval: () => void;
  isEntrypointFileDefined: boolean;
  isDebugging: boolean;
  isRunning: boolean;
  key: string;
  pauseDisabled?: boolean;
  sourceChapter?: number;
};

function ControlBarAutorunButtons(props: Props) {
  const showRunButton = !props.isDebugging && (
    <ControlBarRunButton
      handleEditorEval={props.handleEditorEval}
      isEntrypointFileDefined={props.isEntrypointFileDefined}
      // Neon Green: #39FF14
      color={props.isRunning ? '#39FF14' : undefined}
      className={props.isRunning ? 'WaitingCursor' : undefined}
      key="run"
    />
  );

  // stop button does not do anything due to the blocking nature of eval methods (e.g. runInContext)
  // to prevent "flickering", we will just disable Stop Button for now
  const conductorEnabled = useConductorEnable();
  const showStopButton = conductorEnabled && props.isRunning && (
    <ControlButton label="Stop" icon={IconNames.STOP} onClick={props.handleInterruptEval} />
  );

  // Pause drives the legacy js-slang debugger (beginDebuggerPause). Under Conductor, every
  // evaluator runs in a Worker and that action is never handled, so the button would be inert -
  // hide it rather than leave dead UI in the control bar.
  const showDebuggerPause = !conductorEnabled &&
    !props.pauseDisabled &&
    props.isRunning &&
    !props.isDebugging && (
      <ControlButton label="Pause" icon={IconNames.STOP} onClick={props.handleDebuggerPause} />
    );

  const showDebuggerResume = !props.isRunning && props.isDebugging && (
    <ControlButton
      label="Resume"
      icon={IconNames.CHEVRON_RIGHT}
      onClick={props.handleDebuggerResume}
    />
  );

  const showDebuggerReset = (label: string) =>
    props.isDebugging && (
      <ControlButton label={label} icon={IconNames.STOP} onClick={props.handleDebuggerReset} />
    );

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
      {conductorEnabled ? (
        <>
          {showRunButton}
          {showStopButton}
        </>
      ) : (
        showStopButton || showRunButton
      )}
      {showDebuggerPause}
      {showDebuggerResume}
      {showDebuggerReset('Stop Debugger')}
    </>
  );
}

export default ControlBarAutorunButtons;
