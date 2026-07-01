import { IconNames } from '@blueprintjs/icons';
import type { SharedbAceUser } from '@sourceacademy/sharedb-ace/types';
import type { InterpreterOutput } from 'src/commons/application/ApplicationTypes';
import Markdown from 'src/commons/Markdown';
import SideContentRemoteExecution from 'src/commons/sideContent/content/remoteExecution/SideContentRemoteExecution';
import SideContentSessionManagement from 'src/commons/sideContent/content/SideContentSessionManagement';
import SideContentSubstVisualizer from 'src/commons/sideContent/content/SideContentSubstVisualizer';
import {
  type SideContentLocation,
  type SideContentTab,
  type SideContentTabId,
  SideContentType,
} from 'src/commons/sideContent/SideContentTypes';
import { CONDUCTOR_STEPPER_TAB_ID } from 'src/features/conductor/stepperTab';

export const mobileOnlyTabIds: readonly SideContentTabId[] = [
  SideContentType.mobileEditor,
  SideContentType.mobileEditorRun,
];
export const desktopOnlyTabIds: readonly SideContentTabId[] = [SideContentType.introduction];

export const makeIntroductionTabFrom = (content: string): SideContentTab => ({
  label: 'Introduction',
  iconName: IconNames.HOME,
  body: <Markdown content={content} openLinksInNewWindow />,
  id: SideContentType.introduction,
});

export const makeSessionManagementTabFrom = (
  users: Record<string, SharedbAceUser>,
  playgroundCode: string,
  readOnly: boolean,
): SideContentTab => ({
  label: 'Session Management',
  iconName: IconNames.PEOPLE,
  body: (
    <SideContentSessionManagement
      users={users}
      playgroundCode={playgroundCode}
      readOnly={readOnly}
      workspaceLocation="playground"
    />
  ),
  id: SideContentType.sessionManagement,
});

export const makeRemoteExecutionTabFrom = (
  deviceSecret: string | undefined,
  callback: React.Dispatch<React.SetStateAction<string | undefined>>,
): SideContentTab => ({
  label: 'Remote Execution',
  iconName: IconNames.SATELLITE,
  body: (
    <SideContentRemoteExecution
      workspace="playground"
      secretParams={deviceSecret || undefined}
      callbackFunction={callback}
    />
  ),
  id: SideContentType.remoteExecution,
});

/**
 * A placeholder Stepper tab for conductor languages that offer stepping. It keeps the tab visible in
 * the tab bar so the user can open it (which selects the stepper evaluator — see Playground) even
 * before that evaluator's conductor has loaded. Once it has, the stepper web plugin registers the
 * live tab under the same id and it takes over (de-duplicated in SideContentProvider), so this body
 * only shows during that brief load.
 */
export const makeConductorStepperPlaceholderTab = (): SideContentTab => ({
  label: 'Stepper',
  iconName: IconNames.FLOW_REVIEW,
  body: <Markdown content="Loading the stepper…" />,
  id: CONDUCTOR_STEPPER_TAB_ID,
});

export const makeSubstVisualizerTabFrom = (
  workspaceLocation: SideContentLocation,
  output: InterpreterOutput[],
): SideContentTab => {
  const processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      // check if output is from stepper
      'ast' in editorOutput.value[0]
    ) {
      return editorOutput.value;
    } else {
      return [];
    }
  };

  return {
    label: 'Stepper',
    iconName: IconNames.FLOW_REVIEW,
    body: (
      <SideContentSubstVisualizer
        workspaceLocation={workspaceLocation}
        content={processStepperOutput(output)}
      />
    ),
    id: SideContentType.substVisualizer,
  };
};
