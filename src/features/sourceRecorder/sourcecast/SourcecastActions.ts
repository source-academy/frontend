import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { SourcecastData } from '../SourceRecorderTypes';
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
