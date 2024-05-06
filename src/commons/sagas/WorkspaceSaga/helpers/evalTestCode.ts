import { Context, interrupt, runInContext } from 'js-slang';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { call, put, race, take } from 'redux-saga/effects';
import InterpreterActions from 'src/commons/application/actions/InterpreterActions';

import { TestcaseType, TestcaseTypes } from '../../../assessment/AssessmentTypes';
import { actions } from '../../../utils/ActionsHelper';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { dumpDisplayBuffer } from './dumpDisplayBuffer';

export function* evalTestCode(
  code: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  index: number,
  type: TestcaseType
) {
  yield put(actions.resetTestcase(workspaceLocation, index));
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, {
      scheduler: 'preemptive',
      originalMaxExecTime: execTime,
      throwInfiniteLoops: true
    }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(InterpreterActions.beginInterruptExecution.type)
  });

  if (interrupted) {
    interrupt(context);
    yield* dumpDisplayBuffer(workspaceLocation);
    // Redundancy, added ensure that interruption results in an error.
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, `Execution of testcase ${index} aborted`, 750);
    return;
  }

  yield* dumpDisplayBuffer(workspaceLocation);
  /** result.status here is either 'error' or 'finished'; 'suspended' is not possible
   *  since debugger is presently disabled in assessment and grading environments
   */
  if (result.status === 'error') {
    yield put(actions.evalInterpreterError(context.errors, workspaceLocation));
    yield put(actions.evalTestcaseFailure(context.errors, workspaceLocation, index));
  } else if (result.status === 'finished') {
    // Execution of the testcase is successful, i.e. no errors were raised
    yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
    yield put(actions.evalTestcaseSuccess(result.value, workspaceLocation, index));
  }

  // If a opaque testcase was executed, remove its output from the REPL
  if (type === TestcaseTypes.opaque) {
    yield put(actions.clearReplOutputLast(workspaceLocation));
  }
}
