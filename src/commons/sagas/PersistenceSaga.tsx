import { Intent } from '@blueprintjs/core';
import { Chapter, Variant } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
  PERSISTENCE_INITIALISE,
  PERSISTENCE_OPEN_PICKER,
  PERSISTENCE_SAVE_FILE,
  PERSISTENCE_SAVE_FILE_AS,
  PersistenceFile
} from '../../features/persistence/PersistenceTypes';
import { store } from '../../pages/createStore';
import SessionActions from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { showSimpleConfirmDialog, showSimplePromptDialog } from '../utils/DialogHelper';
import {
  dismiss,
  showMessage,
  showSuccessMessage,
  showWarningMessage
} from '../utils/notifications/NotificationsHelper';
import { AsyncReturnType } from '../utils/TypeHelper';
import { safeTakeEvery as takeEvery, safeTakeLatest as takeLatest } from './SafeEffects';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'profile https://www.googleapis.com/auth/drive.file';
const UPLOAD_PATH = 'https://www.googleapis.com/upload/drive/v3/files';

// Special ID value for the Google Drive API.
const ROOT_ID = 'root';

const MIME_SOURCE = 'text/plain';
// const MIME_FOLDER = 'application/vnd.google-apps.folder';

export function* persistenceSaga(): SagaIterator {
  yield takeLatest(SessionActions.logoutGoogle.type, function* () {
    yield put(actions.playgroundUpdatePersistenceFile(undefined));
    yield call(ensureInitialised);
    yield call([gapi.auth2.getAuthInstance(), 'signOut']);
  });

  yield takeLatest(PERSISTENCE_OPEN_PICKER, function* (): any {
    let toastKey: string | undefined;
    try {
      yield call(ensureInitialisedAndAuthorised);

      const { id, name, picked } = yield call(pickFile, 'Pick a file to open');
      if (!picked) {
        return;
      }
      const confirmOpen: boolean = yield call(showSimpleConfirmDialog, {
        title: 'Opening from Google Drive',
        contents: (
          <p>
            Opening <strong>{name}</strong> will overwrite the current contents of your workspace.
            Are you sure?
          </p>
        ),
        positiveLabel: 'Open',
        negativeLabel: 'Cancel'
      });
      if (!confirmOpen) {
        return;
      }

      toastKey = yield call(showMessage, {
        message: 'Opening file...',
        timeout: 0,
        intent: Intent.PRIMARY
      });

      const { result: meta } = yield call([gapi.client.drive.files, 'get'], {
        fileId: id,
        fields: 'appProperties'
      });
      const contents = yield call([gapi.client.drive.files, 'get'], { fileId: id, alt: 'media' });
      const activeEditorTabIndex: number | null = yield select(
        (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
      );
      if (activeEditorTabIndex === null) {
        throw new Error('No active editor tab found.');
      }
      yield put(actions.updateEditorValue('playground', activeEditorTabIndex, contents.body));
      yield put(actions.playgroundUpdatePersistenceFile({ id, name, lastSaved: new Date() }));
      if (meta && meta.appProperties) {
        yield put(
          actions.chapterSelect(
            parseInt(meta.appProperties.chapter || '4', 10) as Chapter,
            meta.appProperties.variant || Variant.DEFAULT,
            'playground'
          )
        );
        yield put(
          actions.externalLibrarySelect(
            Object.values(ExternalLibraryName).find(v => v === meta.appProperties.external) ||
              ExternalLibraryName.NONE,
            'playground'
          )
        );
      }

      yield call(showSuccessMessage, `Loaded ${name}.`, 1000);
    } catch (ex) {
      console.error(ex);
      yield call(showWarningMessage, `Error while opening file.`, 1000);
    } finally {
      if (toastKey) {
        dismiss(toastKey);
      }
    }
  });

  yield takeLatest(PERSISTENCE_SAVE_FILE_AS, function* (): any {
    let toastKey: string | undefined;
    try {
      yield call(ensureInitialisedAndAuthorised);

      const [activeEditorTabIndex, editorTabs, chapter, variant, external] = yield select(
        (state: OverallState) => [
          state.workspaces.playground.activeEditorTabIndex,
          state.workspaces.playground.editorTabs,
          state.workspaces.playground.context.chapter,
          state.workspaces.playground.context.variant,
          state.workspaces.playground.externalLibrary
        ]
      );

      if (activeEditorTabIndex === null) {
        throw new Error('No active editor tab found.');
      }
      const code = editorTabs[activeEditorTabIndex].value;

      const pickedDir: PickFileResult = yield call(
        pickFile,
        'Pick a folder, or cancel to pick the root folder',
        {
          pickFolders: true,
          showFolders: true,
          showFiles: false
        }
      );

      const saveToDir: PersistenceFile = pickedDir.picked
        ? pickedDir
        : { id: ROOT_ID, name: 'My Drive' };

      const pickedFile: PickFileResult = yield call(
        pickFile,
        `Saving to ${saveToDir.name}; pick a file to overwrite, or cancel to save as a new file`,
        {
          pickFolders: false,
          showFolders: false,
          showFiles: true,
          rootFolder: saveToDir.id
        }
      );

      if (pickedFile.picked) {
        const reallyOverwrite: boolean = yield call(showSimpleConfirmDialog, {
          title: 'Saving to Google Drive',
          contents: (
            <span>
              Really overwrite <strong>{pickedFile.name}</strong>?
            </span>
          )
        });
        if (!reallyOverwrite) {
          return;
        }
        yield put(actions.playgroundUpdatePersistenceFile(pickedFile));
        yield put(actions.persistenceSaveFile(pickedFile));
      } else {
        const response: AsyncReturnType<typeof showSimplePromptDialog> = yield call(
          showSimplePromptDialog,
          {
            title: 'Saving to Google Drive',
            contents: (
              <>
                <p>
                  Saving to folder <strong>{saveToDir.name}</strong>.
                </p>
                <p>Save as name?</p>
              </>
            ),
            positiveLabel: 'Save as new file',
            negativeLabel: 'Cancel',
            props: {
              validationFunction: value => !!value
            }
          }
        );

        if (!response.buttonResponse) {
          return;
        }

        const config: IPlaygroundConfig = {
          chapter,
          variant,
          external
        };

        toastKey = yield call(showMessage, {
          message: `Saving as ${response.value}...`,
          timeout: 0,
          intent: Intent.PRIMARY
        });

        const newFile = yield call(
          createFile,
          response.value,
          saveToDir.id,
          MIME_SOURCE,
          code,
          config
        );

        yield put(actions.playgroundUpdatePersistenceFile({ ...newFile, lastSaved: new Date() }));
        yield call(
          showSuccessMessage,
          `${response.value} successfully saved to Google Drive.`,
          1000
        );
      }
    } catch (ex) {
      console.error(ex);
      yield call(showWarningMessage, `Error while saving file.`, 1000);
    } finally {
      if (toastKey) {
        dismiss(toastKey);
      }
    }
  });

  yield takeEvery(
    PERSISTENCE_SAVE_FILE,
    function* ({ payload: { id, name } }: ReturnType<typeof actions.persistenceSaveFile>) {
      let toastKey: string | undefined;
      try {
        toastKey = yield call(showMessage, {
          message: `Saving as ${name}...`,
          timeout: 0,
          intent: Intent.PRIMARY
        });

        yield call(ensureInitialisedAndAuthorised);

        const [activeEditorTabIndex, editorTabs, chapter, variant, external] = yield select(
          (state: OverallState) => [
            state.workspaces.playground.activeEditorTabIndex,
            state.workspaces.playground.editorTabs,
            state.workspaces.playground.context.chapter,
            state.workspaces.playground.context.variant,
            state.workspaces.playground.externalLibrary
          ]
        );

        if (activeEditorTabIndex === null) {
          throw new Error('No active editor tab found.');
        }
        const code = editorTabs[activeEditorTabIndex].value;

        const config: IPlaygroundConfig = {
          chapter,
          variant,
          external
        };
        yield call(updateFile, id, name, MIME_SOURCE, code, config);
        yield put(actions.playgroundUpdatePersistenceFile({ id, name, lastSaved: new Date() }));
        yield call(showSuccessMessage, `${name} successfully saved to Google Drive.`, 1000);
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while saving file.`, 1000);
      } finally {
        if (toastKey) {
          dismiss(toastKey);
        }
      }
    }
  );

  yield takeEvery(PERSISTENCE_INITIALISE, ensureInitialised);
}

interface IPlaygroundConfig {
  chapter: string;
  variant: string;
  external: string;
}

// Reason for this: we don't want to initialise and load the gapi JS until
// it is actually needed
// Note the following properties of Promises:
// - It is okay to call .then() multiple times on the same promise
// - It is okay to call resolve() multiple times (the subsequent resolves have
//   no effect
// See ECMA 262: https://www.ecma-international.org/ecma-262/6.0/#sec-promise-resolve-functions
// These two properties make a Promise a good way to have a lazy singleton
// (in this case, the singleton is not an object but the initialisation of the
// gapi library)
let startInitialisation: (_: void) => void;
const initialisationPromise: Promise<void> = new Promise(res => {
  startInitialisation = res;
}).then(initialise);

function handleUserChanged(user: gapi.auth2.GoogleUser) {
  store.dispatch(
    actions.setGoogleUser(user.isSignedIn() ? user.getBasicProfile().getEmail() : undefined)
  );
}

async function initialise() {
  await new Promise((resolve, reject) =>
    gapi.load('client:auth2', { callback: resolve, onerror: reject })
  );
  await gapi.client.init({
    apiKey: Constants.googleApiKey,
    clientId: Constants.googleClientId,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  });
  gapi.auth2.getAuthInstance().currentUser.listen(handleUserChanged);
  handleUserChanged(gapi.auth2.getAuthInstance().currentUser.get());
}

function* ensureInitialised() {
  startInitialisation();
  yield initialisationPromise;
}

function* ensureInitialisedAndAuthorised() {
  yield call(ensureInitialised);
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    yield gapi.auth2.getAuthInstance().signIn();
  }
}

type PickFileResult =
  | { id: string; name: string; mimeType: string; parentId: string; picked: true }
  | { picked: false };

function pickFile(
  title: string,
  options?: {
    pickFolders?: boolean;
    showFolders?: boolean;
    showFiles?: boolean;
    rootFolder?: string;
  }
): Promise<PickFileResult> {
  const pickFolders = typeof options?.pickFolders === 'undefined' ? false : options?.pickFolders;
  const showFolders = typeof options?.showFolders === 'undefined' ? true : options?.showFolders;
  const showFiles = typeof options?.showFiles === 'undefined' ? true : options?.showFiles;
  return new Promise(res => {
    gapi.load('picker', () => {
      const view = new google.picker.DocsView(
        showFiles ? google.picker.ViewId.DOCS : google.picker.ViewId.FOLDERS
      );
      if (options?.rootFolder) {
        view.setParent(options.rootFolder);
      }
      view.setOwnedByMe(true);
      view.setIncludeFolders(showFolders);
      view.setSelectFolderEnabled(pickFolders);
      view.setMode(google.picker.DocsViewMode.LIST);

      const picker = new google.picker.PickerBuilder()
        .setTitle(title)
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .addView(view)
        .setOAuthToken(
          gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token
        )
        .setAppId(Constants.googleAppId!)
        .setDeveloperKey(Constants.googleApiKey!)
        .setCallback((data: any) => {
          switch (data[google.picker.Response.ACTION]) {
            case google.picker.Action.PICKED: {
              const { id, name, mimeType, parentId } = data.docs[0];
              res({ id, name, mimeType, parentId, picked: true });
              break;
            }
            case google.picker.Action.CANCEL: {
              res({ picked: false });
              break;
            }
          }
        })
        .build();
      picker.setVisible(true);
    });
  });
}

function createFile(
  filename: string,
  parent: string,
  mimeType: string,
  contents: string = '',
  config: IPlaygroundConfig | {}
): Promise<PersistenceFile> {
  const name = filename;
  const meta = {
    name,
    mimeType,
    parents: [parent],
    appProperties: {
      source: true,
      ...config
    }
  };

  const { body, headers } = createMultipartBody(meta, contents, mimeType);

  return gapi.client
    .request({
      path: UPLOAD_PATH,
      method: 'POST',
      params: {
        uploadType: 'multipart'
      },
      headers,
      body
    })
    .then(({ result }) => ({ id: result.id, name: result.name }));
}

function updateFile(
  id: string,
  name: string,
  mimeType: string,
  contents: string = '',
  config: IPlaygroundConfig | {}
): Promise<any> {
  const meta = {
    name,
    mimeType,
    appProperties: {
      source: true,
      ...config
    }
  };

  const { body, headers } = createMultipartBody(meta, contents, mimeType);

  return gapi.client.request({
    path: UPLOAD_PATH + '/' + id,
    method: 'PATCH',
    params: {
      uploadType: 'multipart'
    },
    headers,
    body
  });
}

function createMultipartBody(
  meta: any,
  contents: string,
  contentsMime: string
): { body: string; boundary: string; headers: { [name: string]: string } } {
  const metaJson = JSON.stringify(meta);
  let boundary: string;
  do {
    boundary = generateBoundary();
  } while (metaJson.includes(boundary) || contents.includes(boundary));

  const body = `--${boundary}
Content-Type: application/json; charset=utf-8

${JSON.stringify(meta)}
--${boundary}
Content-Type: ${contentsMime}

${contents}
--${boundary}--
`;

  return { body, boundary, headers: { 'Content-Type': `multipart/related; boundary=${boundary}` } };
}

// Adapted from
// https://github.com/form-data/form-data/blob/master/lib/form_data.js

// Copyright (c) 2012 Felix Geisendörfer (felix@debuggable.com) and contributors

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function generateBoundary(): string {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  let boundary = '--------------------------';
  for (let i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }

  return boundary;
}

// End adapted part

export default persistenceSaga;
