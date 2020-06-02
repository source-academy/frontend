import { OverallState } from '../application/ApplicationTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

export const getDynamicTabs = (
    location: WorkspaceLocation,
    overallState: OverallState
): SideContentTab[] => {

    // TODO: Change so it is extendable + consider to be async
    const toSpawn = sampleTab.toSpawn(location, overallState)
        && !sampleTab.toDespawn(location, overallState);

    return toSpawn ? [sampleTab] : [] as SideContentTab[];
};