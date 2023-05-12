import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';
import { SourcecastData } from 'src/features/sourceRecorder/SourceRecorderTypes';
import { action } from 'typesafe-actions';

import { FETCH_SOURCECAST_INDEX, UPDATE_SOURCECAST_INDEX } from './SourcecastTypes';

export const fetchSourcecastIndex = (workspaceLocation: WorkspaceLocation) =>
  action(FETCH_SOURCECAST_INDEX, {
    workspaceLocation
  });

export const updateSourcecastIndex = (
  index: SourcecastData[],
  workspaceLocation: WorkspaceLocation
) =>
  action(UPDATE_SOURCECAST_INDEX, {
    index,
    workspaceLocation
  });
