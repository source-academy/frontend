import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

const potentialTabs: SideContentTab[] = [sampleTab];

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const isEmptyDebuggerContext = Object.keys(debuggerContext).length === 0;
  if (isEmptyDebuggerContext) {
    return [] as SideContentTab[];
  }

  return potentialTabs.filter(tab => tab.toSpawn(debuggerContext));
};
