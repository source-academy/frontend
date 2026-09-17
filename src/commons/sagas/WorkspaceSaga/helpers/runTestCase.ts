import type { Context } from 'js-slang';
import type { SourceError } from 'js-slang/dist/errors/base';
import { random } from 'lodash-es';
import { call, put, select, type StrictEffect } from 'redux-saga/effects';

import { selectConductorEnable } from '../../../../features/conductor/flagConductorEnable';
import LanguageDirectoryActions from '../../../../features/directory/LanguageDirectoryActions';
import {
  TEST_CASE_EVALUATOR_ID,
  TEST_CASE_LANGUAGE_ID,
} from '../../../../features/directory/testCaseLanguage';
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

/**
 * Shifts a Conductor-reported error's line numbers back by the number of prepend lines baked
 * into runTestCaseConductor's combined file, mirroring evalCode.ts's toConductorSourceError -
 * without this, an error in the student's own first line is reported at
 * `prepend line count + 1` (source-academy/frontend#4244), same off-by-N bug, different call
 * site: this saga concatenates prepend into the combined file itself (see runTestCaseConductor's
 * own doc comment) rather than going through evalEditorSaga's Run-only concatenation, so
 * evalCodeConductorSaga's own prepend-offset correction (gated on an editor Run's actionType)
 * never applies here. A location's line of 0 means "no location info"
 * (toConductorSourceError's own fallback for an error shape it doesn't recognise) and is left
 * untouched rather than shifted into a misleadingly specific line 1.
 */
function shiftErrorLines(error: SourceError, lineOffset: number): SourceError {
  const shift = (line: number) => (line > 0 ? Math.max(1, line - lineOffset) : line);
  return {
    ...error,
    location: {
      start: { ...error.location.start, line: shift(error.location.start.line) },
      end: { ...error.location.end, line: shift(error.location.end.line) },
    },
  };
}

export function* runTestCaseConductor(
  workspaceLocation: WorkspaceLocation,
  index: number,
  value: string,
  testcase: string,
  type: TestcaseType,
  prepend: string,
  postpend: string,
  execTime: number,
  /**
   * Skip this call's own switch-to-TEST_CASE-language/restore dance - set by runAllTestcases
   * (WorkspaceSaga/index.ts), which switches once for the whole batch of testcases instead of
   * once per testcase. Repeatedly switching `state.languageDirectory`'s selection back and forth
   * between every testcase (each switch tears down and rebuilds the Conductor session - see
   * conductorEvaluatorCache.ts's ensureConductorSessionSaga) raced with Conductor's own internal
   * teardown often enough to throw an uncaught "Conduit already terminated" from inside the
   * vendored library - see source-academy/frontend#4232. A single testcase run from the
   * Autograder tab's individual "click to test" button still does its own switch/restore, since
   * there's no batch to hoist it out of.
   */
  skipLanguageSwitch?: boolean,
): Generator<StrictEffect, boolean, any> {
  const context: Context<any> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context,
  );

  // Testing always runs the full concatenated bundle under Python's top chapter,
  // regardless of the student's own assigned sub-chapter, so a sub-chapter's syntax
  // restrictions (e.g. recursion-only, no loops) aren't enforced by the evaluator here.
  // A postpend that needs to check the student didn't use a disallowed construct can
  // call the chapter-4 `parse(__program__)` builtin and walk the returned tree itself
  // (loop nodes come back tagged "while_loop"/"for_loop") - __program__ is the
  // student's own source as a string, injected here since `value` only exists as
  // executed code otherwise. JSON.stringify produces a valid Python string literal for
  // any source text (its backslash/quote/control-char/unicode escapes are a subset of
  // Python's).
  const studentSourceLiteral = `__program__ = ${JSON.stringify(value)}`;

  const combinedFilePath = '/testcase.py';
  const combinedCode = [prepend, value, studentSourceLiteral, postpend, testcase]
    .filter(part => part && part.trim().length > 0)
    .join('\n');
  // Matches the filter above: an empty/whitespace-only prepend contributes no line to
  // combinedCode at all, so it must not shift error line numbers either.
  const prependLineOffset = prepend.trim().length > 0 ? prepend.split('\n').length : 0;

  yield put(actions.resetTestcase(workspaceLocation, index));

  // Grading always runs under TEST_CASE_LANGUAGE_ID/EVALUATOR_ID (see testCaseLanguage.ts),
  // regardless of the assessment's own chapter-derived language - temporarily override the
  // shared selection for this call, then restore it, so a subsequent Run (outside the testing
  // tab) goes back to using the student's assigned sub-chapter. Skipped when the caller (see
  // runAllTestcases in WorkspaceSaga/index.ts) already switched once for the whole batch.
  let selectedLanguageId: string | null = null;
  let selectedEvaluatorId: string | null = null;
  if (!skipLanguageSwitch) {
    ({ selectedLanguageId, selectedEvaluatorId } = yield select(
      (state: OverallState) => state.languageDirectory,
    ));
    yield put(LanguageDirectoryActions.setSelectedLanguage(TEST_CASE_LANGUAGE_ID));
    yield put(LanguageDirectoryActions.setSelectedEvaluator(TEST_CASE_EVALUATOR_ID));
  }

  try {
    yield call(
      evalCodeSaga,
      { [combinedFilePath]: combinedCode },
      combinedFilePath,
      context,
      execTime,
      EVAL_SILENT,
      workspaceLocation,
    );
  } finally {
    if (!skipLanguageSwitch) {
      if (selectedLanguageId) {
        yield put(LanguageDirectoryActions.setSelectedLanguage(selectedLanguageId));
        if (selectedEvaluatorId) {
          yield put(LanguageDirectoryActions.setSelectedEvaluator(selectedEvaluatorId));
        }
      } else {
        yield put(LanguageDirectoryActions.clearSelectedLanguage());
      }
    }
  }

  const output: Array<{ type: string; consoleLogs?: string[]; errors?: any }> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].output,
  );
  const lastOutput = output[output.length - 1];

  let passed: boolean;
  if (lastOutput?.type === 'errors') {
    const errors: SourceError[] = lastOutput.errors;
    const correctedErrors =
      prependLineOffset > 0
        ? errors.map(error => shiftErrorLines(error, prependLineOffset))
        : errors;
    yield put(actions.evalTestcaseFailure(correctedErrors, workspaceLocation, index));
    passed = false;
  } else {
    // The testcase's own print(...) is the last line printed, since nothing runs
    // after it in the combined file; earlier prints (if any) belong to
    // prepend/value/postpend and aren't part of what's being graded. consoleLogs
    // isn't guaranteed to be on the absolute last output entry - stdout and result
    // messages travel on separate Conductor channels with no guaranteed relative
    // ordering, and output is never cleared between testcase runs - so search
    // backward for the last entry that actually carries console logs.
    const lastLogOutput = [...output].reverse().find(entry => entry?.consoleLogs?.length);
    const printedLines = lastLogOutput?.consoleLogs ?? [];
    const printedResult =
      printedLines.length > 0 ? printedLines[printedLines.length - 1].trim() : '';
    yield put(
      actions.evalTestcaseSuccess({ toReplString: () => printedResult }, workspaceLocation, index),
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
  skipLanguageSwitch?: boolean,
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
      skipLanguageSwitch,
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
