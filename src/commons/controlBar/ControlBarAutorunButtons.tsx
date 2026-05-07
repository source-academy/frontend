import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import ControlButton from '../ControlButton';
import { useFeature } from '../featureFlags/useFeature';
import { useResponsive } from '../utils/Hooks';
import ControlBarRunButton from './ControlBarRunButton';

type Props = {
  handleDebuggerPause: () => void;
  handleDebuggerReset: () => void;
  handleDebuggerResume: () => void;
  handleEditorEval: () => void;
  handleInterruptEval: () => void;
  handleToggleEditorAutorun?: () => void;
  isEntrypointFileDefined: boolean;
  isDebugging: boolean;
  isEditorAutorun?: boolean;
  isRunning: boolean;
  key: string;
  autorunDisabled?: boolean;
  pauseDisabled?: boolean;
  sourceChapter?: number;
};

const ControlBarAutorunButtons: React.FC<Props> = props => {
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

  const showAutoRunIndicator = props.isEditorAutorun && (
    <ControlButton label="Auto" icon={IconNames.AUTOMATIC_UPDATES} />
  );

  // stop button does not do anything due to the blocking nature of eval methods (e.g. runInContext)
  // to prevent "flickering", we will just disable Stop Button for now
  const conductorEnabled = useFeature(flagConductorEnable);
  const showStopButton = conductorEnabled && props.isRunning && (
    <ControlButton label="Stop" icon={IconNames.STOP} onClick={props.handleInterruptEval} />
  );

  const showDebuggerPause = !props.pauseDisabled && props.isRunning && !props.isDebugging && (
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
      {!props.autorunDisabled && (
        <div className="Switch">
          <Switch
            label=""
            checked={props.isEditorAutorun}
            onChange={props.handleToggleEditorAutorun}
          />
        </div>
      )}
      {conductorEnabled ? (
        <>
          {showAutoRunIndicator || showRunButton}
          {showStopButton}
        </>
      ) : (
        showAutoRunIndicator || showStopButton || showRunButton
      )}
      {showDebuggerPause}
      {showDebuggerResume}
      {showDebuggerReset('Stop Debugger')}
    </>
  );
};

export default ControlBarAutorunButtons;
