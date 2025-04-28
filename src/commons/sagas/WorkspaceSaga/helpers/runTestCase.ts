import type { Context } from 'js-slang';
import { random } from 'lodash';
import { call, put, select, StrictEffect } from 'redux-saga/effects';

import type { OverallState } from '../../../application/ApplicationTypes';
import { actions } from '../../../utils/ActionsHelper';
import { makeElevatedContext } from '../../../utils/JsSlangHelper';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';
import { blockExtraMethods } from './blockExtraMethods';
import { clearContext } from './clearContext';
import { evalCodeSaga } from './evalCode';
import { evalTestCode } from './evalTestCode';
import { restoreExtraMethods } from './restoreExtraMethods';

export function* runTestCase(
  workspaceLocation: WorkspaceLocation,
  index: number
): Generator<StrictEffect, boolean, any> {
  const {
    editorTabs: {
      [0]: { value }
    },
    editorTestcases: {
      [index]: { program: testcase, type: type }
    },
    execTime,
    programPrependValue: prepend,
    programPostpendValue: postpend
  } = yield* selectWorkspace(workspaceLocation);

  yield* clearContext(workspaceLocation, value);

  // Do NOT clear the REPL output!

  /**
   *  Shard a new privileged context elevated to use Source chapter 4 for testcases - enables
   *  grader programs in postpend to run as expected without raising interpreter errors
   *  But, do not persist this context to the workspace state - this prevent students from using
   *  this elevated context to run dis-allowed code beyond the current chapter from the REPL
   */
  const context: Context<any> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context
  );

  // Execute prepend silently in privileged context
  const elevatedContext = makeElevatedContext(context);
  const prependFilePath = '/prepend.js';
  const prependFiles = {
    [prependFilePath]: prepend
  };
  yield call(
    evalCodeSaga,
    prependFiles,
    prependFilePath,
    elevatedContext,
    execTime,
    EVAL_SILENT,
    workspaceLocation
  );

  // Block use of methods from privileged context using a randomly generated blocking key
  // Then execute student program silently in the original workspace context
  const blockKey = String(random(1048576, 68719476736));
  yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  const valueFilePath = '/value.js';
  const valueFiles = {
    [valueFilePath]: value
  };
  yield call(
    evalCodeSaga,
    valueFiles,
    valueFilePath,
    context,
    execTime,
    EVAL_SILENT,
    workspaceLocation
  );

  // Halt execution if the student's code in the editor results in an error
  if (context.errors.length) {
    yield put(actions.evalTestcaseFailure(context.errors, workspaceLocation, index));
    return false;
  }

  // Execute postpend silently back in privileged context, if it exists
  if (postpend) {
    // TODO: consider doing a swap. If the user has modified any of the variables,
    // i.e. reusing any of the "reserved" names, prevent it from being accessed in the REPL.
    yield* restoreExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
    const postpendFilePath = '/postpend.js';
    const postpendFiles = {
      [postpendFilePath]: postpend
    };
    yield call(
      evalCodeSaga,
      postpendFiles,
      postpendFilePath,
      elevatedContext,
      execTime,
      EVAL_SILENT,
      workspaceLocation
    );
    yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  }
  // Finally execute the testcase function call in the privileged context
  yield* evalTestCode(testcase, elevatedContext, execTime, workspaceLocation, index, type);
  return true;
}
