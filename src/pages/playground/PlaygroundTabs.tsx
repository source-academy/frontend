import { IconNames } from '@blueprintjs/icons';

import { ResultOutput } from '../../commons/application/ApplicationTypes';
import SideContentDataVisualizer from '../../commons/sideContent/SideContentDataVisualizer';
import SideContentHtmlDisplay from '../../commons/sideContent/SideContentHtmlDisplay';
import { SideContentTab, SideContentType } from '../../commons/sideContent/SideContentTypes';

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

export const makeHtmlDisplayTabFrom = (
  output: ResultOutput,
  handleError: (errorMsg: string) => void
): SideContentTab => ({
  label: 'HTML Display',
  iconName: IconNames.MODAL,
  body: <SideContentHtmlDisplay content={output.value} handleAddHtmlConsoleError={handleError} />,
  id: SideContentType.htmlDisplay
});
