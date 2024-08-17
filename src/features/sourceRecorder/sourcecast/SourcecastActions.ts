import { createActions } from 'src/commons/redux/utils';

import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { SourcecastData } from '../SourceRecorderTypes';

const SourcecastActions = createActions('sourcecast', {
  fetchSourcecastIndex: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  updateSourcecastIndex: (index: SourcecastData[], workspaceLocation: WorkspaceLocation) => ({
    index,
    workspaceLocation
  })
});

// For compatibility with existing code (reducer)
export const { fetchSourcecastIndex, updateSourcecastIndex } = SourcecastActions;

// For compatibility with existing code (actions helper)
export default SourcecastActions;
