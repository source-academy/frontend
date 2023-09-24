import { createReducer } from "@reduxjs/toolkit";
import type { SourceError, Value } from "js-slang/dist/types";
import { stringify } from "js-slang/dist/utils/stringify";

import type { CodeOutput } from "../../../application/ApplicationTypes"
import Constants from "../../../utils/Constants";
import { createActions } from "../../utils";
import { defaultRepl } from "../WorkspaceReduxTypes";

export const replActions = createActions('repl', {
  browseReplHistoryDown: 0,
  browseReplHistoryUp: 0,
  clearReplInput: 0,
  clearReplOutput: 0,
  clearReplOutputLast: 0,
  evalInterpreterError: (errors: SourceError[]) => errors,
  evalInterpreterSuccess: (value: Value) => value,
  handleConsoleLog: (logs: string[]) => logs,
  sendReplInputToOutput: (output: string): CodeOutput => ({
    type: 'code',
    value: output
  }),
  updateReplValue: (newValue: string) => newValue,
})

export const replActionNames = Object.keys(replActions) as Array<keyof typeof replActions>

export const replReducer = createReducer(defaultRepl, builder => {
  builder.addCase(replActions.browseReplHistoryDown, (state) => {
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
  })

  builder.addCase(replActions.browseReplHistoryUp, (state) => {
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
  })

  builder.addCase(replActions.clearReplInput, (state) => { state.replValue = '' })
  builder.addCase(replActions.clearReplOutput, (state) => { state.output = [] })
  builder.addCase(replActions.clearReplOutputLast, (state) => { state.output.pop() })
  builder.addCase(replActions.evalInterpreterError, (state, { payload }) => {
    const lastOutput = state.output[state.output.length - 1]
    state.output.push({
      type: 'errors',
      errors: payload,
      consoleLogs: lastOutput !== undefined && lastOutput.type === 'running' ? lastOutput.consoleLogs : []
    })
  })
  builder.addCase(replActions.evalInterpreterSuccess, (state, { payload }) => {
    const lastOutput = state.output[state.output.length - 1]      
    state.output.push({
      type: 'result',
      value: stringify(payload),
      consoleLogs: lastOutput !== undefined && lastOutput.type === 'running' ? lastOutput.consoleLogs : []
    })
  })
  builder.addCase(replActions.handleConsoleLog, (state, { payload }) => {
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
  })

  builder.addCase(replActions.sendReplInputToOutput, (state, { payload }) => {
    // CodeOutput properties exist in parallel with workspaceLocation
    state.output.push(payload)      

    if (payload.value !== '') {
      state.replHistory.records.unshift(payload.value)
    } else {
      if (state.replHistory.records.length === Constants.maxBrowseIndex) {
        state.replHistory.records.pop()
      }
    }
  })

  builder.addCase(replActions.updateReplValue, (state, { payload }) => {
    state.replValue = payload
  })
})
