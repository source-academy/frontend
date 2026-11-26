/// <reference types="gapi.auth2" />
import { expectSaga } from 'redux-saga-test-plan';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import PlaygroundActions from 'src/features/playground/PlaygroundActions';
import { assert, beforeAll, describe, expect, test, vi } from 'vitest';

import { actions } from '../utils/ActionsHelper';
import { recordLegacyUsage } from '../utils/legacyUsage';
import PersistenceSaga from './PersistenceSaga';

// mock away the store - the store can't be created in a test, it leads to
// import cycles
// this is before the import below because we need to ensure PersistenceSaga's
// store import is mocked
vi.mock('../../pages/createStore');
// Counting the use of a legacy path goes to Sentry; here it is only checked that it happens.
vi.mock('../utils/legacyUsage', () => ({ recordLegacyUsage: vi.fn() }));

const USER_EMAIL = 'test@email.com';
const FILE_ID = '123';
const FILE_NAME = 'file';
const FILE_DATA = '// Hello world';
const LANGUAGE = 'source3';
const EVALUATOR = 'source3Js';

beforeAll(() => {
  const authInstance: gapi.auth2.GoogleAuth = {
    signOut: () => {},
    isSignedIn: {
      get: () => true,
      listen: () => {},
    },
    currentUser: {
      listen: () => {},
      get: () => ({
        isSignedIn: () => true,
        getBasicProfile: () => ({
          getEmail: () => USER_EMAIL,
        }),
      }),
    },
  } as any;

  window.gapi = {
    client: {
      request: () => {},
      init: () => Promise.resolve(),
      drive: {
        files: {
          get: () => {},
        },
      },
    },
    load: (apiName: string, callbackOrConfig: gapi.CallbackOrConfig) =>
      typeof callbackOrConfig === 'function' ? callbackOrConfig() : callbackOrConfig.callback(),
    auth2: {
      getAuthInstance: () => authInstance,
    },
  } as any;
});

test('LOGOUT_GOOGLE causes logout', async () => {
  const signOut = vi.spyOn(window.gapi.auth2.getAuthInstance(), 'signOut');

  await expectSaga(PersistenceSaga).dispatch(actions.logoutGoogle()).silentRun();
  expect(signOut).toBeCalled();
});

describe('PERSISTENCE_OPEN_PICKER', () => {
  test('opens a file on success path', () => {
    return expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceOpenPicker())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              return { id: FILE_ID, name: FILE_NAME, picked: true };
            case 'showSimpleConfirmDialog':
              return true;
            case 'get':
              expect(effect.args[0].fileId).toEqual(FILE_ID);
              if (effect.args[0].alt === 'media') {
                return { body: FILE_DATA };
              } else if (effect.args[0].fields.includes('appProperties')) {
                return {
                  result: {
                    appProperties: {
                      language: LANGUAGE,
                      evaluator: EVALUATOR,
                    },
                  },
                };
              }
              break;
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .put.like({
        action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
      })
      .put(actions.updateEditorValue('playground', 0, FILE_DATA))
      .put(LanguageDirectoryActions.setSelectedLanguage(LANGUAGE, EVALUATOR))
      .silentRun();
  });

  test('selects the Source language of a file saved with a legacy chapter', () => {
    return expectSaga(PersistenceSaga)
      .dispatch(actions.persistenceOpenPicker())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              return { id: FILE_ID, name: FILE_NAME, picked: true };
            case 'showSimpleConfirmDialog':
              return true;
            case 'get':
              if (effect.args[0].alt === 'media') {
                return { body: FILE_DATA };
              }
              return {
                result: { appProperties: { chapter: '2', variant: 'default', external: 'NONE' } },
              };
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .withState({
        workspaces: { playground: { activeEditorTabIndex: 0, editorTabs: [{ value: FILE_DATA }] } },
      })
      .put(LanguageDirectoryActions.setSelectedLanguage('source2'))
      .silentRun()
      .then(() => {
        expect(recordLegacyUsage).toHaveBeenCalledWith('drive-file-chapter');
      });
  });

  test('does not open if picker cancelled', () => {
    return expectSaga(PersistenceSaga)
      .dispatch(actions.persistenceOpenPicker())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              return { id: '', name: '', picked: true };
            case 'showSimpleConfirmDialog':
              return false;
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .not.put.like({ action: { type: PlaygroundActions.playgroundUpdatePersistenceFile.type } })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
  });

  test('does not open if confirm cancelled', () => {
    return expectSaga(PersistenceSaga)
      .dispatch(actions.persistenceOpenPicker())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              return { picked: false };
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .not.put.like({ action: { type: PlaygroundActions.playgroundUpdatePersistenceFile.type } })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
  });
});

test('PERSISTENCE_SAVE_FILE saves', () => {
  let updateFileCalled = false;
  return expectSaga(PersistenceSaga)
    .withState({
      languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
      workspaces: {
        playground: {
          activeEditorTabIndex: 0,
          editorTabs: [{ value: FILE_DATA }],
        },
      },
    })
    .dispatch(actions.persistenceSaveFile({ id: FILE_ID, name: FILE_NAME }))
    .provide({
      call(effect, next) {
        switch (effect.fn.name) {
          case 'updateFile':
            expect(updateFileCalled).toBe(false);
            expect(effect.args).toEqual([
              FILE_ID,
              FILE_NAME,
              'text/plain',
              FILE_DATA,
              { language: LANGUAGE, evaluator: EVALUATOR },
            ]);
            updateFileCalled = true;
            return;
          case 'ensureInitialisedAndAuthorised':
          case 'ensureInitialised':
          case 'showMessage':
          case 'showSuccessMessage':
            return;
        }
        assert.fail(`unexpected function called: ${effect.fn.name}`);
      },
    })
    .put.like({
      action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
    })
    .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
    .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
    .silentRun();
});

describe('PERSISTENCE_SAVE_FILE_AS', () => {
  const DIR = { id: '456', name: 'Directory', picked: true };

  test('overwrites a file in root', async () => {
    let updateFileCalled = false;
    await expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return { picked: false };
              }
              expect(effect.args[1].rootFolder).toEqual('root');
              return { id: FILE_ID, name: FILE_NAME, picked: true };
            case 'updateFile':
              expect(updateFileCalled).toBe(false);
              expect(effect.args).toEqual([
                FILE_ID,
                FILE_NAME,
                'text/plain',
                FILE_DATA,
                { language: LANGUAGE, evaluator: EVALUATOR },
              ]);
              updateFileCalled = true;
              return;
            case 'showSimpleConfirmDialog':
              return true;
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .put.like({
        action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
      })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
    expect(updateFileCalled).toBe(true);
  });

  test('overwrites a file in a directory', async () => {
    let updateFileCalled = false;
    await expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return DIR;
              }
              expect(effect.args[1].rootFolder).toEqual(DIR.id);
              return { id: FILE_ID, name: FILE_NAME, picked: true };
            case 'updateFile':
              expect(updateFileCalled).toBe(false);
              expect(effect.args).toEqual([
                FILE_ID,
                FILE_NAME,
                'text/plain',
                FILE_DATA,
                { language: LANGUAGE, evaluator: EVALUATOR },
              ]);
              updateFileCalled = true;
              return;
            case 'showSimpleConfirmDialog':
              return true;
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .put.like({
        action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
      })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
    expect(updateFileCalled).toBe(true);
  });

  test('creates a new file in root', async () => {
    let createFileCalled = false;
    await expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return { picked: false };
              }
              expect(effect.args[1].rootFolder).toEqual('root');
              return { picked: false };
            case 'createFile':
              expect(createFileCalled).toBe(false);
              expect(effect.args).toEqual([
                FILE_NAME,
                'root',
                'text/plain',
                FILE_DATA,
                { language: LANGUAGE, evaluator: EVALUATOR },
              ]);
              createFileCalled = true;
              return { id: FILE_ID, name: FILE_NAME };
            case 'showSimplePromptDialog':
              return { buttonResponse: true, value: FILE_NAME };
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
            default:
              console.log(effect);
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .put.like({
        action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
      })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
    expect(createFileCalled).toBe(true);
  });

  test('creates a new file in a directory', async () => {
    let createFileCalled = false;
    await expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return DIR;
              }
              expect(effect.args[1].rootFolder).toEqual(DIR.id);
              return { picked: false };
            case 'createFile':
              expect(createFileCalled).toBe(false);
              expect(effect.args).toEqual([
                FILE_NAME,
                DIR.id,
                'text/plain',
                FILE_DATA,
                { language: LANGUAGE, evaluator: EVALUATOR },
              ]);
              createFileCalled = true;
              return { id: FILE_ID, name: FILE_NAME };
            case 'showSimplePromptDialog':
              return { buttonResponse: true, value: FILE_NAME };
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
            default:
              console.log(effect);
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .put.like({
        action: actions.playgroundUpdatePersistenceFile({ id: FILE_ID, name: FILE_NAME }),
      })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun();
    expect(createFileCalled).toBe(true);
  });

  test('does not overwrite if cancelled', () =>
    expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return DIR;
              }
              expect(effect.args[1].rootFolder).toEqual(DIR.id);
              return { id: FILE_ID, name: FILE_NAME, picked: true };
            case 'showSimpleConfirmDialog':
              return false;
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .not.put.like({ action: { type: PlaygroundActions.playgroundUpdatePersistenceFile.type } })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun());

  test('does not create a new file if cancelled', () =>
    expectSaga(PersistenceSaga)
      .withState({
        languageDirectory: { selectedLanguageId: LANGUAGE, selectedEvaluatorId: EVALUATOR },
        workspaces: {
          playground: {
            activeEditorTabIndex: 0,
            editorTabs: [{ value: FILE_DATA }],
          },
        },
      })
      .dispatch(actions.persistenceSaveFileAs())
      .provide({
        call(effect, next) {
          switch (effect.fn.name) {
            case 'pickFile':
              if (effect.args[1].pickFolders) {
                return DIR;
              }
              expect(effect.args[1].rootFolder).toEqual(DIR.id);
              return { picked: false };
            case 'showSimplePromptDialog':
              return { buttonResponse: false, value: FILE_NAME };
            case 'ensureInitialisedAndAuthorised':
            case 'ensureInitialised':
            case 'showMessage':
            case 'showSuccessMessage':
              return;
            default:
              console.log(effect);
          }
          assert.fail(`unexpected function called: ${effect.fn.name}`);
        },
      })
      .not.put.like({ action: { type: PlaygroundActions.playgroundUpdatePersistenceFile.type } })
      .not.put.like({ action: { type: WorkspaceActions.updateEditorValue.type } })
      .not.put.like({ action: { type: LanguageDirectoryActions.setSelectedLanguage.type } })
      .silentRun());
});
