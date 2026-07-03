import type { Context } from 'js-slang';
import { random } from 'lodash-es';
import { call, put, select, type StrictEffect } from 'redux-saga/effects';

import { selectConductorEnable } from '../../../../features/conductor/flagConductorEnable';
import type { OverallState } from '../../../application/ApplicationTypes';
import type { TestcaseType } from '../../../assessment/AssessmentTypes';
import { TestcaseTypes } from '../../../assessment/AssessmentTypes';
import { actions } from '../../../utils/ActionsHelper';
import { makeElevatedContext } from '../../../utils/JsSlangHelper';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';
import { blockExtraMethods } from './blockExtraMethods';
import { clearContext } from './clearContext';
import { evalCodeSaga } from './evalCode';
import { evalTestCode } from './evalTestCode';
import { restoreExtraMethods } from './restoreExtraMethods';

/**
 * Runs a testcase under Conductor.
 *
 * Conductor gives every evalCodeSaga call its own fresh, isolated worker that is
 * terminated afterwards - there is no persistent privileged context to run prepend,
 * student code, postpend, and the testcase separately into, unlike the legacy
 * js-slang path below. Instead, concatenate all four into a single file and run it
 * in one Conductor call: prepend and postpend definitions stay visible to the
 * student's code and to each other in the same order they'd run in normally, and
 * any prepend-defined mutable state (e.g. a counter incremented by a prepend
 * function that postpend later checks) is preserved since it's all one execution.
 *
 * Unlike js-slang, ordinary Python statements don't produce a REPL-style "value of
 * the last expression" - running a .py script bare-expression-statement-last, e.g.
 * `lte(x, y)`, discards the result exactly like it would in a real Python
 * interpreter. So testcases are expected to `print(...)` what they want graded, and
 * grading compares the last printed line against the testcase's `answer`, not a
 * returned value.
 *
 * That comparison is re-dispatched via evalTestcaseSuccess/Failure so the existing
 * testcase UI (which reads editorTestcases[index].result and compares
 * stringify(result) against .answer) keeps working - the captured output line is
 * wrapped in a toReplString() so stringify() renders it verbatim instead of adding
 * the JSON-style quoting it'd otherwise apply to a plain string.
 */
function* runTestCaseConductor(
  workspaceLocation: WorkspaceLocation,
  index: number,
  value: string,
  testcase: string,
  type: TestcaseType,
  prepend: string,
  postpend: string,
  execTime: number,
): Generator<StrictEffect, boolean, any> {
  const context: Context<any> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context,
  );

  const combinedFilePath = '/testcase.py';
  const combinedCode = [prepend, value, postpend, testcase]
    .filter(part => part && part.trim().length > 0)
    .join('\n');

  yield put(actions.resetTestcase(workspaceLocation, index));

  yield call(
    evalCodeSaga,
    { [combinedFilePath]: combinedCode },
    combinedFilePath,
    context,
    execTime,
    EVAL_SILENT,
    workspaceLocation,
  );

  const lastOutput: { type: string; consoleLogs?: string[]; errors?: any } | undefined =
    yield select((state: OverallState) => state.workspaces[workspaceLocation].output.slice(-1)[0]);

  let passed: boolean;
  if (lastOutput?.type === 'errors') {
    yield put(actions.evalTestcaseFailure(lastOutput.errors, workspaceLocation, index));
    passed = false;
  } else {
    // The testcase's own print(...) is the last line printed, since nothing runs
    // after it in the combined file; earlier prints (if any) belong to
    // prepend/value/postpend and aren't part of what's being graded.
    const printedLines = lastOutput?.consoleLogs ?? [];
    const printedResult = printedLines.length > 0 ? printedLines[printedLines.length - 1].trim() : '';
    yield put(
      actions.evalTestcaseSuccess(
        { toReplString: () => printedResult },
        workspaceLocation,
        index,
      ),
    );
    passed = true;
  }

  if (type === TestcaseTypes.opaque) {
    yield put(actions.clearReplOutputLast(workspaceLocation));
  }

  return passed;
}

export function* runTestCase(
  workspaceLocation: WorkspaceLocation,
  index: number,
): Generator<StrictEffect, boolean, any> {
  const {
    editorTabs: {
      [0]: { value },
    },
    editorTestcases: {
      [index]: { program: testcase, type: type },
    },
    execTime,
    programPrependValue: prepend,
    programPostpendValue: postpend,
  } = yield* selectWorkspace(workspaceLocation);

  yield* clearContext(workspaceLocation, value);

  // Do NOT clear the REPL output!

  const isConductorEnabled: boolean = yield select(selectConductorEnable);
  if (isConductorEnabled) {
    return yield* runTestCaseConductor(
      workspaceLocation,
      index,
      value,
      testcase,
      type,
      prepend,
      postpend,
      execTime,
    );
  }

  /**
   *  Shard a new privileged context elevated to use Source chapter 4 for testcases - enables
   *  grader programs in postpend to run as expected without raising interpreter errors
   *  But, do not persist this context to the workspace state - this prevent students from using
   *  this elevated context to run dis-allowed code beyond the current chapter from the REPL
   */
  const context: Context<any> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context,
  );

  // Execute prepend silently in privileged context
  const elevatedContext = makeElevatedContext(context);
  const prependFilePath = '/prepend.js';
  const prependFiles = {
    [prependFilePath]: prepend,
  };
  yield call(
    evalCodeSaga,
    prependFiles,
    prependFilePath,
    elevatedContext,
    execTime,
    EVAL_SILENT,
    workspaceLocation,
  );

  // Block use of methods from privileged context using a randomly generated blocking key
  // Then execute student program silently in the original workspace context
  const blockKey = String(random(1048576, 68719476736));
  yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  const valueFilePath = '/value.js';
  const valueFiles = {
    [valueFilePath]: value,
  };
  yield call(
    evalCodeSaga,
    valueFiles,
    valueFilePath,
    context,
    execTime,
    EVAL_SILENT,
    workspaceLocation,
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
      [postpendFilePath]: postpend,
    };
    yield call(
      evalCodeSaga,
      postpendFiles,
      postpendFilePath,
      elevatedContext,
      execTime,
      EVAL_SILENT,
      workspaceLocation,
    );
    yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  }
  // Finally execute the testcase function call in the privileged context
  yield* evalTestCode(testcase, elevatedContext, execTime, workspaceLocation, index, type);
  return true;
}
