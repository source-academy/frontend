import { OverallState } from '../application/ApplicationTypes';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

export const getDynamicTabs = (
  activeTabsLabel: string[],
  location: WorkspaceLocation,
  overallState: OverallState
): SideContentTab[] => {
  // TODO: Make use of activeTabsLabel to help deciding toSpawn or not

  // TODO: Make each check to separate library are sync
  // TODO: Make each toSpawn() and toDeSpawn() sync

  // TODO: Change so it is extendable + ensure it is async (toSpawn and toDespawn might take long)
  const toSpawn =
    sampleTab.toSpawn(location, overallState) && !sampleTab.toDespawn(location, overallState);

  return toSpawn ? [sampleTab] : ([] as SideContentTab[]);
};
