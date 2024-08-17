import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import { CodeOutput, InterpreterOutput } from '../../application/ApplicationTypes';
import Constants from '../../utils/Constants';
import WorkspaceActions from '../WorkspaceActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import { WorkspaceManagerState } from '../WorkspaceTypes';

export const handleReplActions = (builder: ActionReducerMapBuilder<WorkspaceManagerState>) => {
  builder
    .addCase(WorkspaceActions.browseReplHistoryDown, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      if (state[workspaceLocation].replHistory.browseIndex === null) {
        // Not yet started browsing history, nothing to do
        return;
      }
      if (state[workspaceLocation].replHistory.browseIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state[workspaceLocation].replHistory.browseIndex! - 1;
        const newReplValue = state[workspaceLocation].replHistory.records[newIndex];

        state[workspaceLocation].replValue = newReplValue;
        state[workspaceLocation].replHistory.browseIndex = newIndex;
        return;
      }
      // Browsing history, no earlier records to show; return replValue to
      // the last value when user started browsing
      const newIndex = null;
      const newReplValue = state[workspaceLocation].replHistory.originalValue;
      const newRecords = state[workspaceLocation].replHistory.records.slice();

      state[workspaceLocation].replValue = newReplValue;
      state[workspaceLocation].replHistory = {
        browseIndex: newIndex,
        records: newRecords,
        originalValue: ''
      };
    })
    .addCase(WorkspaceActions.browseReplHistoryUp, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const lastRecords = state[workspaceLocation].replHistory.records;
      const lastIndex = state[workspaceLocation].replHistory.browseIndex;
      if (
        lastRecords.length === 0 ||
        (lastIndex !== null && lastRecords[lastIndex + 1] === undefined)
      ) {
        // There is no more later history to show
        return;
      }
      if (lastIndex === null) {
        // Not yet started browsing, initialise the index & array
        const newIndex = 0;
        const newRecords = lastRecords.slice();
        const originalValue = state[workspaceLocation].replValue;
        const newReplValue = newRecords[newIndex];

        state[workspaceLocation].replValue = newReplValue;
        state[workspaceLocation].replHistory = {
          browseIndex: newIndex,
          records: newRecords,
          originalValue
        };
        return;
      }
      // Browsing history, and still have later history to show
      const newIndex = lastIndex + 1;
      const newReplValue = lastRecords[newIndex];
      state[workspaceLocation].replValue = newReplValue;
      state[workspaceLocation].replHistory.browseIndex = newIndex;
    })
    .addCase(WorkspaceActions.clearReplInput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].replValue = '';
    })
    .addCase(WorkspaceActions.clearReplOutputLast, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].output.pop();
    })
    .addCase(WorkspaceActions.clearReplOutput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].output = [];
    })
    .addCase(WorkspaceActions.sendReplInputToOutput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // CodeOutput properties exist in parallel with workspaceLocation
      const newOutput: InterpreterOutput[] = state[workspaceLocation].output.concat(
        action.payload as CodeOutput
      );

      let newReplHistoryRecords: string[];
      if (action.payload.value !== '') {
        newReplHistoryRecords = [action.payload.value].concat(
          state[workspaceLocation].replHistory.records
        );
      } else {
        newReplHistoryRecords = state[workspaceLocation].replHistory.records;
      }
      if (newReplHistoryRecords.length > Constants.maxBrowseIndex) {
        newReplHistoryRecords.pop();
      }

      state[workspaceLocation].output = newOutput;
      state[workspaceLocation].replHistory.records = newReplHistoryRecords;
    })
    .addCase(WorkspaceActions.evalRepl, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
    })
    .addCase(WorkspaceActions.updateReplValue, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].replValue = action.payload.newReplValue;
    });
};
