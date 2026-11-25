import type { SourceError } from 'js-slang/dist/errors/base';
import { call, put, select, type StrictEffect } from 'redux-saga/effects';

import LanguageDirectoryActions from '../../../../features/directory/LanguageDirectoryActions';
import { selectTestCaseLanguage } from '../../../../features/directory/testCaseLanguage';
import type { OverallState } from '../../../application/ApplicationTypes';
import type { TestcaseType } from '../../../assessment/AssessmentTypes';
import { TestcaseTypes } from '../../../assessment/AssessmentTypes';
import { actions } from '../../../utils/ActionsHelper';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';
import { evalCodeConductorSaga } from './evalCode';

/**
 * Runs a testcase under Conductor.
 *
 * Conductor gives every evalCodeSaga call its own fresh, isolated worker that is
 * terminated afterwards - there is no persistent privileged context to run prepend,
 * student code, postpend, and the testcase separately into, unlike the legacy
 * js-slang path. Instead, concatenate all four into a single file and run it
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
  /**
   * Skip this call's own switch-to-the-grader's-language/restore dance - set by runAllTestcases
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
  // The test cases run under the question's frontend grader language and evaluator (see
  // testCaseLanguage.ts), which need not be the student's own: for Python, the full language, so that
  // the sub-chapter's syntax restrictions (e.g. recursion-only, no loops) aren't enforced on prepend
  // and postpend. The student's own program has been run under the user language before this (by
  // evalEditorSaga), which is where its error messages come from.
  const graderLanguage: { languageId: string; evaluatorId: string } | undefined = yield select(
    (state: OverallState) => selectTestCaseLanguage(state, workspaceLocation),
  );
  if (!graderLanguage) {
    yield call(
      showWarningMessage,
      'This question does not name a language for its test cases that the language directory has.',
    );
    return false;
  }
  // The combined file is named by the extension of the language that runs it (`.py`, `.ml`, ...)
  const extension: string = yield select(
    (state: OverallState) =>
      state.languageDirectory.languageMap[graderLanguage.languageId]?.defaultFileExtension ?? 'py',
  );

  // A postpend that needs to check the student didn't use a disallowed construct can call the
  // chapter-4 `parse(__program__)` builtin of Python and walk the returned tree itself (loop nodes come
  // back tagged "while_loop"/"for_loop") - __program__ is the student's own source as a string,
  // injected here since `value` only exists as executed code otherwise. JSON.stringify produces a valid
  // Python string literal for any source text (its backslash/quote/control-char/unicode escapes are a
  // subset of Python's). It is Python's feature: other languages have no such variable.
  const studentSourceLiteral = extension === 'py' ? `__program__ = ${JSON.stringify(value)}` : '';

  const combinedFilePath = `/testcase.${extension}`;
  const combinedCode = [prepend, value, studentSourceLiteral, postpend, testcase]
    .filter(part => part && part.trim().length > 0)
    .join('\n');
  // Matches the filter above: an empty/whitespace-only prepend contributes no line to
  // combinedCode at all, so it must not shift error line numbers either.
  const prependLineOffset = prepend.trim().length > 0 ? prepend.split('\n').length : 0;

  yield put(actions.resetTestcase(workspaceLocation, index));

  // Grading runs under that language - temporarily override the shared selection for this call, then
  // restore it, so a subsequent Run (outside the testing tab) goes back to using the user's language.
  // Skipped when the caller (see runAllTestcases in WorkspaceSaga/index.ts) already switched once for
  // the whole batch.
  let selectedLanguageId: string | null = null;
  let selectedEvaluatorId: string | null = null;
  if (!skipLanguageSwitch) {
    ({ selectedLanguageId, selectedEvaluatorId } = yield select(
      (state: OverallState) => state.languageDirectory,
    ));
    yield put(LanguageDirectoryActions.setSelectedLanguage(graderLanguage.languageId));
    yield put(LanguageDirectoryActions.setSelectedEvaluator(graderLanguage.evaluatorId));
  }

  try {
    yield call(
      evalCodeConductorSaga,
      { [combinedFilePath]: combinedCode },
      combinedFilePath,
      workspaceLocation,
      EVAL_SILENT,
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
    programPrependValue: prepend,
    programPostpendValue: postpend,
  } = yield* selectWorkspace(workspaceLocation);

  // Do NOT clear the REPL output!

  return yield* runTestCaseConductor(
    workspaceLocation,
    index,
    value,
    testcase,
    type,
    prepend,
    postpend,
    skipLanguageSwitch,
  );
}
