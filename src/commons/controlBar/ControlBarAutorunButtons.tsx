import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';
import { useResponsive } from '../utils/Hooks';
import ControlBarRunButton from './ControlBarRunButton';

type Props = {
  handleEditorEval: () => void;
  handleInterruptEval: () => void;
  isEntrypointFileDefined: boolean;
  isRunning: boolean;
  key: string;
  sourceChapter?: number;
};

function ControlBarAutorunButtons(props: Props) {
  const showRunButton = (
    <ControlBarRunButton
      handleEditorEval={props.handleEditorEval}
      isEntrypointFileDefined={props.isEntrypointFileDefined}
      // Neon Green: #39FF14
      color={props.isRunning ? '#39FF14' : undefined}
      className={props.isRunning ? 'WaitingCursor' : undefined}
      key="run"
    />
  );

  const showStopButton = props.isRunning && (
    <ControlButton label="Stop" icon={IconNames.STOP} onClick={props.handleInterruptEval} />
  );

  const { isMobileBreakpoint } = useResponsive();

  return isMobileBreakpoint ? (
    showStopButton
  ) : (
    <>
      {showRunButton}
      {showStopButton}
    </>
  );
}

export default ControlBarAutorunButtons;
