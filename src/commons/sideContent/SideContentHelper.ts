import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

export const getDynamicTabs = async (debuggerContext: DebuggerContext): Promise<SideContentTab[]> => {
  const isEmptyDebuggerContext = Object.keys(debuggerContext).length === 0;

  if (isEmptyDebuggerContext) {
    return [] as SideContentTab[];
  }
  // TODO: Make use of activeTabsLabel to help deciding toSpawn or not

  // TODO: Make each check to separate moduele tab are sync


  // TODO: Make each toSpawn() and toDeSpawn() sync

  // TODO: Change so it is extendable + ensure it is async (toSpawn and toDespawn might take long)
  const wantToSpawn = sampleTab.toSpawn(debuggerContext);

  return wantToSpawn ? [sampleTab] : ([] as SideContentTab[]);
};
