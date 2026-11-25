import { type IconName, IconNames } from '@blueprintjs/icons';
import type { IPluginTab } from '@sourceacademy/plugin-directory/dist/types';
import type { SharedbAceUser } from '@sourceacademy/sharedb-ace/types';
import Markdown from 'src/commons/Markdown';
import SideContentRemoteExecution from 'src/commons/sideContent/content/remoteExecution/SideContentRemoteExecution';
import SideContentDocumentation from 'src/commons/sideContent/content/SideContentDocumentation';
import SideContentSessionManagement from 'src/commons/sideContent/content/SideContentSessionManagement';
import {
  type SideContentLocation,
  type SideContentTab,
  type SideContentTabId,
  SideContentType,
} from 'src/commons/sideContent/SideContentTypes';

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

export const makeDocumentationTabFrom = (
  workspaceLocation: SideContentLocation,
): SideContentTab => ({
  label: 'Documentation',
  iconName: IconNames.MANUAL,
  body: <SideContentDocumentation workspaceLocation={workspaceLocation} />,
  id: SideContentType.documentation,
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
 * A placeholder for the tab of a plugin that an evaluator names (see `toolTabsOf`), from what the
 * plugin directory says about the tab. It keeps the tab visible in the tab bar so the user can open
 * it (which selects the evaluator that the tab belongs to — see Playground) even before that
 * evaluator's conductor has loaded. Once it has, the plugin registers the live tab under the same id
 * and it takes over in the same position, so this body only shows during that brief load.
 */
export const makeConductorToolPlaceholderTab = ({
  id,
  label,
  iconName,
}: IPluginTab): SideContentTab => ({
  label,
  iconName: iconName as IconName,
  body: <Markdown content={`Loading the ${label.toLowerCase()}…`} />,
  id,
});

export const makeConductorDataVisualizerPlaceholderTab = (): SideContentTab => ({
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <Markdown content="Call `draw_data` in your program to visualize data structures here." />,
  id: SideContentType.dataVisualizer,
});
