import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { expectSaga } from 'redux-saga-test-plan';
import { describe, expect, test } from 'vitest';

import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import SessionActions from '../application/actions/SessionActions';
import { defaultLanguageDirectory } from '../application/ApplicationTypes';
import { languageDirectoryHandlers } from './LanguageDirectorySaga';

function makeMockLanguageDefinition(id: string, evaluatorIds: string[]): ILanguageDefinition {
  return {
    id,
    name: id,
    evaluators: evaluatorIds.map(evaluatorId => ({
      id: evaluatorId,
      name: evaluatorId,
      path: `https://example.com/${evaluatorId}.js`,
      capabilities: [],
    })),
  };
}

const languages = [
  makeMockLanguageDefinition('python1', ['python1Py2js']),
  makeMockLanguageDefinition('python2', ['python2Py2js']),
  makeMockLanguageDefinition('python3', ['python3Py2js']),
];

const conductorEnabledFlags = { modifiedFlags: { 'conductor.enable': true } };

describe('setLanguages', () => {
  test('selects the course-configured default language, derived from sourceChapter, when Conductor is enabled', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: { sourceChapter: 2 },
        featureFlags: conductorEnabledFlags,
        // A dispatched action's reducer runs before the saga middleware sees it, so by the time
        // this handler's `select` executes, `state.languageDirectory.languages` already reflects
        // the action being dispatched below - mirror that here rather than leaving it empty.
        languageDirectory: { ...defaultLanguageDirectory, languages },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('python2', 'python2Py2js', true))
      .dispatch(LanguageDirectoryActions.setLanguages(languages))
      .silentRun();
  });

  test('falls back to the first directory entry when there is no course', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: {},
        featureFlags: conductorEnabledFlags,
        languageDirectory: { ...defaultLanguageDirectory, languages },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('python1', undefined, true))
      .dispatch(LanguageDirectoryActions.setLanguages(languages))
      .silentRun();
  });

  test('falls back to the first directory entry when Conductor is disabled', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: { sourceChapter: 2 },
        featureFlags: { modifiedFlags: { 'conductor.enable': false } },
        languageDirectory: { ...defaultLanguageDirectory, languages },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('python1', undefined, true))
      .dispatch(LanguageDirectoryActions.setLanguages(languages))
      .silentRun();
  });

  test('re-resolves a pending deliberate selection (e.g. a share link) instead of applying the course default', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: { sourceChapter: 2 },
        featureFlags: conductorEnabledFlags,
        languageDirectory: {
          ...defaultLanguageDirectory,
          languages,
          selectedLanguageId: 'python3',
          isDefaultSelection: false,
        },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('python3', undefined))
      .dispatch(LanguageDirectoryActions.setLanguages(languages))
      .silentRun();
  });
});

describe('setCourseConfiguration', () => {
  test('applies the newly-loaded course default when the directory is already loaded and the current selection is still a default', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        // The session reducer runs before the saga sees this dispatch, so sourceChapter already
        // reflects the setCourseConfiguration payload below by the time this handler's `select` runs.
        session: { sourceChapter: 2 },
        featureFlags: conductorEnabledFlags,
        languageDirectory: {
          ...defaultLanguageDirectory,
          languages,
          selectedLanguageId: 'python1',
          isDefaultSelection: true,
        },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('python2', 'python2Py2js', true))
      .dispatch(SessionActions.setCourseConfiguration({ sourceChapter: 2 } as any))
      .silentRun();
  });

  test('does not clobber a deliberate selection the user already made', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: {},
        featureFlags: conductorEnabledFlags,
        languageDirectory: {
          ...defaultLanguageDirectory,
          languages,
          selectedLanguageId: 'python3',
          isDefaultSelection: false,
        },
      })
      .not.put.actionType(LanguageDirectoryActions.setSelectedLanguage.type)
      .dispatch(SessionActions.setCourseConfiguration({ sourceChapter: 2 } as any))
      .silentRun();
  });

  test('does nothing when the directory has not loaded yet (setLanguages will apply the default itself)', () => {
    return expectSaga(languageDirectoryHandlers)
      .withState({
        session: {},
        featureFlags: conductorEnabledFlags,
        languageDirectory: defaultLanguageDirectory,
      })
      .not.put.actionType(LanguageDirectoryActions.setSelectedLanguage.type)
      .dispatch(SessionActions.setCourseConfiguration({ sourceChapter: 2 } as any))
      .silentRun();
  });
});
