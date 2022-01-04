import { Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useMediaQuery } from 'react-responsive';

import { isNativeJSLang } from '../application/ApplicationTypes';
import controlButton from '../ControlButton';
import Constants from '../utils/Constants';
import { ControlBarDummyRunButton } from './ControlBarDummyRunButton';
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
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isNativeJS = props.sourceChapter && isNativeJSLang(props.sourceChapter);

  return isMobileBreakpoint ? (
    <>
      {props.isRunning &&
        !isNativeJS &&
        controlButton('Stop', IconNames.STOP, props.handleInterruptEval)}
      {(!props.pauseDisabled &&
        props.isRunning &&
        !props.isDebugging &&
        controlButton('Pause', IconNames.STOP, props.handleDebuggerPause)) ||
        (!props.isRunning &&
          props.isDebugging &&
          controlButton('Resume', IconNames.CHEVRON_RIGHT, props.handleDebuggerResume))}
      {props.isDebugging && controlButton('Stop', IconNames.STOP, props.handleDebuggerReset)}
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
      {(props.isEditorAutorun && controlButton('Auto', IconNames.AUTOMATIC_UPDATES)) ||
        // Temp: disable `Stop` button for NativeJS for consistency with `Source` languages:
        // disabled `Stop`/`Pause` + allowed UI re-rendering === enabled `Stop`/`Pause` + disallowed UI re-rendering
        //               ^NativeJS                                      ^Source languages
        (props.isRunning &&
          !isNativeJS &&
          controlButton('Stop', IconNames.STOP, props.handleInterruptEval)) ||
        (!props.isDebugging && !props.isRunning && (
          <ControlBarRunButton handleEditorEval={props.handleEditorEval} key="run" />
        ))}
      {
        // Temp: add a placeholder for NativeJS, to prevent flickering
        props.isRunning && isNativeJS && <ControlBarDummyRunButton />
      }
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
