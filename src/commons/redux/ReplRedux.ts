import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import { SourceError, Value } from "js-slang/dist/types";
import { stringify } from "js-slang/dist/utils/stringify";

import { CodeOutput, InterpreterOutput } from "../application/ApplicationTypes"
import Constants from "../utils/Constants";

export type ReplState = {
  readonly output: InterpreterOutput[]
  readonly replHistory: {
    readonly browseIndex: null | number; // [0, 49] if browsing, else null
    readonly records: string[];
    readonly originalValue: string;
  }
  readonly replValue: string
}

export const defaultRepl: ReplState = {
  output: [],
  replHistory: {
    browseIndex: null,
    records: [],
    originalValue: ''
  },
  replValue: ''
}

export const { actions: replActions, reducer: replReducer } = createSlice({
  name: 'repl',
  initialState: defaultRepl,
  reducers: {
    browseReplHistoryDown(state) {
      if (state.replHistory.browseIndex === null) {
        // Not yet started browsing history, nothing to do
        return;
      } else if (state.replHistory.browseIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state.replHistory.browseIndex - 1;
        state.replValue = state.replHistory.records[newIndex];
        state.replHistory.browseIndex = newIndex
      } else {
        // Browsing history, no earlier records to show; return replValue to
        // the last value when user started browsing
        state.replHistory.browseIndex = null
        state.replValue = state.replHistory.originalValue;
      }
    },
    browseReplHistoryUp(state) {
      const lastRecords = state.replHistory.records;
      const lastIndex = state.replHistory.browseIndex;
      if (
        lastRecords.length === 0 ||
        (lastIndex !== null && lastRecords[lastIndex + 1] === undefined)
      ) {
        // There is no more later history to show
        return;
      } else if (lastIndex === null) {
        // Not yet started browsing, initialise the index & array
        state.replHistory.browseIndex = 0;
        state.replHistory.originalValue = state.replValue;
      } else {
        // Browsing history, and still have later history to show
        const newIndex = lastIndex + 1;
        state.replValue = lastRecords[newIndex];
        state.replHistory.browseIndex = newIndex
      }
    },
    clearReplInput(state) { state.replValue = '' },
    clearReplOutput(state) { state.output = [] },
    clearReplOutputLast(state) { state.output.pop() },
    evalInterpreterError(state, { payload }: PayloadAction<SourceError[]>) {
      const lastOutput = state.output[state.output.length - 1]
      state.output.push({
        type: 'errors',
        errors: payload,
        consoleLogs: lastOutput !== undefined && lastOutput.type === 'running' ? lastOutput.consoleLogs : []
      })
    },
    evalInterpreterSuccess(state, { payload }: PayloadAction<Value>) {
      const lastOutput = state.output[state.output.length - 1]      
      state.output.push({
        type: 'result',
        value: stringify(payload),
        consoleLogs: lastOutput !== undefined && lastOutput.type === 'running' ? lastOutput.consoleLogs : []
      })
    },
    handleConsoleLog(state, { payload }: PayloadAction<string[]>) {
      /* Possible cases:
       * (1) state[workspaceLocation].output === [], i.e. state[workspaceLocation].output[-1] === undefined
       * (2) state[workspaceLocation].output[-1] is not RunningOutput
       * (3) state[workspaceLocation].output[-1] is RunningOutput */
      const lastOutput = state.output[state.output.length - 1];
      if (lastOutput === undefined || lastOutput.type !== 'running') {
        // New block of output.
        state.output.push({
          type: 'running',
          consoleLogs: payload,
        });
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(payload)
        };
        state.output[state.output.length - 1] = updatedLastOutput
      }
    },
    sendReplInputToOutput(state, { payload }: PayloadAction<CodeOutput>) {
      // CodeOutput properties exist in parallel with workspaceLocation
      state.output.push(payload)      

      if (payload.value !== '') {
        state.replHistory.records.unshift(payload.value)
      } else {
        if (state.replHistory.records.length === Constants.maxBrowseIndex) {
          state.replHistory.records.pop()
        }
      }
    },
    updateReplValue(state, { payload }: PayloadAction<string>) {
      state.replValue = payload
    }
  }
})
