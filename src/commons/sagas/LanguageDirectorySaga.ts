import { languages } from '@sourceacademy/language-directory';
import type {
  IEvaluatorDefinition,
  ILanguageDefinition,
} from '@sourceacademy/language-directory/dist/types';
import { getEvaluatorDefinition } from '@sourceacademy/language-directory/dist/util';
import { call, fork, put, select } from 'redux-saga/effects';
import { selectConductorEnable } from 'src/features/conductor/flagConductorEnable';
import {
  flagDirectoryLanguageUrl,
  selectDirectoryLanguageUrl,
} from 'src/features/directory/flagDirectoryLanguageUrl';

import { deriveLanguageFromChapter } from '../../features/directory/chapterLanguage';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import type { LanguageDirectoryState } from '../../features/directory/LanguageDirectoryTypes';
import SessionActions from '../application/actions/SessionActions';
import type { OverallState } from '../application/ApplicationTypes';
import { defaultEditorValue } from '../application/ApplicationTypes';
import { combineSagaHandlers } from '../redux/utils';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { preloadConductorEvaluatorSaga } from './helpers/conductorEvaluatorCache';

export function* getLanguageDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory,
  );
  if (!directory.selectedLanguageId) {
    return undefined;
  }
  return directory.languageMap[directory.selectedLanguageId];
}

export function* getEvaluatorDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory,
  );
  if (!directory.selectedEvaluatorId) {
    return undefined;
  }
  const language: ILanguageDefinition = yield call(getLanguageDefinitionSaga);
  if (!language) {
    return undefined;
  }
  return getEvaluatorDefinition(language, directory.selectedEvaluatorId);
}

/**
 * The language the current course configures as its default, or `undefined` when there is no course
 * (logged out), the course predates Conductor, or its `sourceChapter` doesn't name a directory entry.
 *
 * Course config stores this as `sourceChapter`, which under Conductor is a 1-based index into the
 * directory rather than a Source chapter — see `deriveLanguageFromChapter`. Admins set it through
 * Ground Control's "Default language" selector.
 */
export function* getCourseDefaultSelectionSaga() {
  const conductorEnabled: boolean = yield select(selectConductorEnable);
  if (!conductorEnabled) {
    // The legacy path drives the language off `playgroundSourceChapter` instead.
    return undefined;
  }
  const languages: ILanguageDefinition[] = yield select(
    (state: OverallState) => state.languageDirectory.languages,
  );
  const sourceChapter: number | undefined = yield select(
    (state: OverallState) => state.session.sourceChapter,
  );
  return deriveLanguageFromChapter(languages, sourceChapter);
}

/**
 * Applies the default selection for `directory`: the course's configured language if one exists,
 * otherwise the first directory entry. Callers must ensure `directory.languages` is non-empty.
 *
 * Always dispatches - including when there's no course default - so that a course whose
 * `sourceChapter` doesn't resolve to a directory entry (no course, or a stale/out-of-range value)
 * still lands on a valid selection instead of leaving a previous course's language selected.
 */
function* applyDefaultSelectionSaga(directory: Pick<LanguageDirectoryState, 'languages'>) {
  const courseDefault: { languageId: string; evaluatorId: string } | undefined = yield call(
    getCourseDefaultSelectionSaga,
  );
  const languageId = courseDefault?.languageId ?? directory.languages[0].id;
  yield put(
    LanguageDirectoryActions.setSelectedLanguage(languageId, courseDefault?.evaluatorId, true),
  );
}

export const languageDirectoryHandlers = combineSagaHandlers({
  [LanguageDirectoryActions.setLanguages.type]: function* () {
    const directory: LanguageDirectoryState = yield select(
      (state: OverallState) => state.languageDirectory,
    );
    if (directory.languages.length === 0) {
      return;
    }
    // Something (e.g. a share link's handleHash) may have already requested a language
    // before the directory finished loading; at that point languageMap was still empty, so
    // the setSelectedLanguage handler below couldn't resolve it and bailed out early. Re-run
    // that same selection now that the directory is populated, instead of unconditionally
    // overwriting it with the first language.
    if (directory.selectedLanguageId && !directory.isDefaultSelection) {
      yield put(
        LanguageDirectoryActions.setSelectedLanguage(
          directory.selectedLanguageId,
          directory.selectedEvaluatorId ?? undefined,
        ),
      );
      return;
    }
    // No deliberate selection is pending, so (re-)apply the default: the current course's
    // configured language if one exists and the session has already loaded, otherwise the first
    // directory entry. If the course config arrives later, its handler below re-applies this -
    // `isDefaultSelection` stays true until something deliberate overrides it.
    yield call(applyDefaultSelectionSaga, directory);
  },
  [SessionActions.setCourseConfiguration.type]: function* () {
    const directory: LanguageDirectoryState = yield select(
      (state: OverallState) => state.languageDirectory,
    );
    // The directory may not have loaded yet (setLanguages will apply the course default itself
    // once it does), and a deliberate selection - the dropdown, a share link, an assessment - must
    // never be clobbered by a course config that happens to arrive afterwards.
    if (directory.languages.length === 0 || !directory.isDefaultSelection) {
      return;
    }
    // Re-apply the default even if the new course has no valid configured language (a stale or
    // out-of-range sourceChapter): otherwise the previous course's language would stay selected,
    // even though it's still marked as a default rather than something the user chose here.
    yield call(applyDefaultSelectionSaga, directory);
  },
  [LanguageDirectoryActions.fetchLanguages.type]: function* () {
    const url: string = yield select(selectDirectoryLanguageUrl);
    let result: ILanguageDefinition[];
    if (url === flagDirectoryLanguageUrl.defaultValue) {
      result = yield call(() => Promise.resolve(languages));
    } else {
      const response = yield call(fetch, url);
      if (!response.ok) {
        throw new Error(`Can't retrieve language directory: ${response.status}`);
      }
      result = yield call([response, 'json']);
    }
    yield put(LanguageDirectoryActions.setLanguages(result));
  },
  [LanguageDirectoryActions.setSelectedEvaluator.type]: function* () {
    const evaluator = yield call(getEvaluatorDefinitionSaga);
    const language: ILanguageDefinition = yield call(getLanguageDefinitionSaga);

    // Set the language's default editor program when switching evaluators, but only while the
    // editor still holds the untouched default (never clobber code the user has written).
    if (language?.defaultProgram != null) {
      const playground = yield select((state: OverallState) => state.workspaces.playground);
      const activeTabIndex: number = playground.activeEditorTabIndex ?? 0;
      const editorValue: string = playground.editorTabs[activeTabIndex]?.value ?? '';
      if (editorValue === defaultEditorValue) {
        yield put(
          WorkspaceActions.updateEditorValue('playground', activeTabIndex, language.defaultProgram),
        );
      }
    }

    // Preload the conductor for the *newly selected* evaluator, so a subsequent Run uses this
    // evaluator (not the language default). Without this, picking e.g. the Stepper evaluator would
    // never update the prepared conductor — the run would keep using the default evaluator, so
    // `hostLoadPlugin("stepper")` would never fire and the Stepper tab would never appear.
    const conductorEnabled: boolean = yield select(selectConductorEnable);
    if (!conductorEnabled) {
      return;
    }
    if (!evaluator?.path) {
      return;
    }

    try {
      yield call(preloadConductorEvaluatorSaga, evaluator.path);
    } catch (error) {
      console.error('Failed to preload:', error);
    }
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* (
    action: ReturnType<typeof LanguageDirectoryActions.setSelectedLanguage>,
  ) {
    // Selecting a language defaults its evaluator to the first one, unless a specific evaluator
    // was requested (e.g. restoring a share link) and it's valid for this language. The actual
    // conductor preload happens in the setSelectedEvaluator handler above (this dispatch triggers
    // it), so switching evaluators afterwards re-preloads the correct one.
    const language = yield call(getLanguageDefinitionSaga);
    if (!language) {
      return;
    }
    const requestedEvaluatorId = action.payload.evaluatorId;
    const evaluatorId = language.evaluators.some(
      (e: IEvaluatorDefinition) => e.id === requestedEvaluatorId,
    )
      ? requestedEvaluatorId
      : language.evaluators[0]?.id;
    if (evaluatorId) {
      yield put(LanguageDirectoryActions.setSelectedEvaluator(evaluatorId));
    }
  },
});

function* LanguageDirectorySaga() {
  yield fork(languageDirectoryHandlers);
  yield put(LanguageDirectoryActions.fetchLanguages());
}

export default LanguageDirectorySaga;
