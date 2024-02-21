import { createAction } from '@reduxjs/toolkit';

import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { SourcecastData } from '../SourceRecorderTypes';
import { FETCH_SOURCECAST_INDEX, UPDATE_SOURCECAST_INDEX } from './SourcecastTypes';

export const fetchSourcecastIndex = createAction(
  FETCH_SOURCECAST_INDEX,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const updateSourcecastIndex = createAction(
  UPDATE_SOURCECAST_INDEX,
  (index: SourcecastData[], workspaceLocation: WorkspaceLocation) => ({
    payload: { index, workspaceLocation }
  })
);
