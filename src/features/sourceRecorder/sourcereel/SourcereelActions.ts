import { createActions } from 'src/commons/redux/utils';

import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { Input, PlaybackData } from '../SourceRecorderTypes';

const SourcereelActions = createActions('sourcereel', {
  deleteSourcecastEntry: (id: number, workspaceLocation: WorkspaceLocation) => ({
    id,
    workspaceLocation
  }),
  recordInit: (initData: PlaybackData['init'], workspaceLocation: WorkspaceLocation) => ({
    initData,
    workspaceLocation
  }),
  recordInput: (input: Input, workspaceLocation: WorkspaceLocation) => ({
    input,
    workspaceLocation
  }),
  resetInputs: (inputs: Input[], workspaceLocation: WorkspaceLocation) => ({
    inputs,
    workspaceLocation
  }),
  timerPause: (workspaceLocation: WorkspaceLocation) => ({
    timeNow: Date.now(),
    workspaceLocation
  }),
  timerReset: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  timerResume: (timeBefore: number, workspaceLocation: WorkspaceLocation) => ({
    timeBefore,
    timeNow: Date.now(),
    workspaceLocation
  }),
  timerStart: (workspaceLocation: WorkspaceLocation) => ({
    timeNow: Date.now(),
    workspaceLocation
  }),
  timerStop: (workspaceLocation: WorkspaceLocation) => ({ timeNow: Date.now(), workspaceLocation })
});

// For compatibility with existing code (actions helper)
export default SourcereelActions;
