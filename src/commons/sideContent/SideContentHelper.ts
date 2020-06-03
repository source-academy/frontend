import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  // TODO: Make use of activeTabsLabel to help deciding toSpawn or not

  // TODO: Make each check to separate library are sync
  // TODO: Make each toSpawn() and toDeSpawn() sync

  // TODO: Change so it is extendable + ensure it is async (toSpawn and toDespawn might take long)
  const wantToSpawn = sampleTab.toSpawn(debuggerContext);
  const wantToDespawn = sampleTab.toDespawn(debuggerContext);
  const toSpawn = wantToSpawn && !wantToDespawn;

  return toSpawn ? [sampleTab] : ([] as SideContentTab[]);
};
