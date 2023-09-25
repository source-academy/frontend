import { IconNames } from '@blueprintjs/icons';
import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import { InterpreterOutput } from 'src/commons/application/ApplicationTypes';
import Markdown from 'src/commons/Markdown';
import SideContentRemoteExecution from 'src/commons/sideContent/content/remoteExecution/SideContentRemoteExecution';
import SideContentSubstVisualizer from 'src/commons/sideContent/content/SideContentSubstVisualizer';
import {
  SideContentLocation,
  SideContentTab,
  SideContentType
} from 'src/commons/sideContent/SideContentTypes';

export const mobileOnlyTabIds: readonly SideContentType[] = [
  SideContentType.mobileEditor,
  SideContentType.mobileEditorRun
];
export const desktopOnlyTabIds: readonly SideContentType[] = [SideContentType.introduction];

export const makeIntroductionTabFrom = (content: string): SideContentTab => ({
  label: 'Introduction',
  iconName: IconNames.HOME,
  body: <Markdown content={content} openLinksInNewWindow={true} />,
  id: SideContentType.introduction
});

export const makeRemoteExecutionTabFrom = (
  deviceSecret: string | undefined,
  callback: React.Dispatch<React.SetStateAction<string | undefined>>
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
  id: SideContentType.remoteExecution
});

export const makeSubstVisualizerTabFrom = (
  workspaceLocation: SideContentLocation,
  output: InterpreterOutput[]
): SideContentTab => {
  const processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      isStepperOutput(editorOutput.value[0])
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
    id: SideContentType.substVisualizer
  };
};
