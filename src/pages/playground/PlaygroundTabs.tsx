import { IconNames } from '@blueprintjs/icons';
import { isStepperOutput } from 'js-slang/dist/stepper/stepper';
import SideContentRemoteExecution from 'src/commons/sideContent/content/remoteExecution/SideContentRemoteExecution';
import SideContentDataVisualizer from 'src/commons/sideContent/content/SideContentDataVisualizer';
import SideContentEnvVisualizer from 'src/commons/sideContent/content/SideContentEnvVisualizer';
import SideContentHtmlDisplay from 'src/commons/sideContent/content/SideContentHtmlDisplay';
import SideContentSubstVisualizer from 'src/commons/sideContent/content/SideContentSubstVisualizer';
import { SideContentTab, SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

import { InterpreterOutput, ResultOutput } from '../../commons/application/ApplicationTypes';
import Markdown from '../../commons/Markdown';

export const mobileOnlyTabIds: readonly SideContentType[] = [
  SideContentType.mobileEditor,
  SideContentType.mobileEditorRun
];
export const desktopOnlyTabIds: readonly SideContentType[] = [SideContentType.introduction];

export const dataVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentDataVisualizer />,
  id: SideContentType.dataVisualizer
};

export const makeEnvVisualizerTabFrom = (workspaceLocation: WorkspaceLocation): SideContentTab => ({
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer workspaceLocation={workspaceLocation} />,
  id: SideContentType.envVisualizer
});

export const makeHtmlDisplayTabFrom = (
  output: ResultOutput,
  handleError: (errorMsg: string) => void
): SideContentTab => ({
  label: 'HTML Display',
  iconName: IconNames.MODAL,
  body: <SideContentHtmlDisplay content={output.value} handleAddHtmlConsoleError={handleError} />,
  id: SideContentType.htmlDisplay
});

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

export const makeSubstVisualizerTabFrom = (output: InterpreterOutput[]): SideContentTab => {
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
    body: <SideContentSubstVisualizer content={processStepperOutput(output)} />,
    id: SideContentType.substVisualizer
  };
};
