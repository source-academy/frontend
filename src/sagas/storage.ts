import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { ActionType } from 'typesafe-actions';
import * as actions from '../actions';

import * as actionTypes from '../actions/actionTypes';
import { IState } from '../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';

let initialized = false;
let currId = '';
let currName = '';

const CLIENT_ID = '352013967309-qmhsu2ddofc79hpa0r3fe4q2djl16d7m.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCCZ2ips3cvuHLLvNiDC6NDzJoGE-WAxHA';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
// const MIME_FOLDER = 'application/vnd.google-apps.folder';
const MIME_SOURCE = 'text/plain';
const APP_ROOT_FOLDER_NAME = 'Source_Academy';

type FilePath = string[]; // A/B/filename = ["A", "B", "filename"]
interface IFile {
  type: 'folder' | 'file';
  path: FilePath;
}

interface IPlaygroundConfig {
  chapter: string;
  variant: string;
  external: string;
}

function getFilename(file: IFile): string {
  if (file.path.length === 0) {
    return APP_ROOT_FOLDER_NAME;
  } else {
    const len = file.path.length;
    return file.path[len - 1];
  }
}

function initialize(token: string): Promise<any> {
  return initializeAuth(token)
    .then(() => {
      initialized = true;
    })
    .catch(reason => {
      // tslint:disable-next-line:no-console
      console.error(reason.message);
    });
}

function ensureInitialized(token: string): Promise<any> {
  if (initialized) {
    return Promise.resolve(null);
  } else {
    return initialize(token);
  }
}

function initializeAuth(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        })
        .then(() => {
          gapi.client.setToken({
            access_token: token
          });
          resolve();
        });
    });
  });
}

function createFile(
  file: IFile,
  parent: null,
  mimeType: string,
  contents: string = '',
  config: IPlaygroundConfig | {}
): Promise<null> {
  const boundary = 'N1UTGHFPQ1M9FB455CRN';
  const name = getFilename(file);
  const meta = {
    name,
    mimeType,
    parents: null,
    appProperties: {
      source: true,
      ...config
    }
  };
  const body = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(meta)}

--${boundary}
Content-Type: ${mimeType}

${contents}

--${boundary}--
`;

  // tslint:disable-next-line:no-console
  console.log('@createFile', meta, body);

  return new Promise((resolve, reject) => {
    gapi.client
      .request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      })
      .then(response => {
        if (response.status !== 200) {
          reject(response);
        } else {
          resolve();
        }
      })
      .catch(reason => {
        // tslint:disable-next-line:no-console
        console.error(reason);
      });
  });
}

function updateFile(
  parent: null,
  mimeType: string,
  contents: string = '',
  config: IPlaygroundConfig | {}
): Promise<null> {
  const boundary = 'N1UTGHFPQ1M9FB455CRN';
  const name = currName;
  const meta = {
    name,
    mimeType,
    parents: null,
    appProperties: {
      source: true,
      ...config
    }
  };
  const body = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(meta)}

--${boundary}
Content-Type: ${mimeType}

${contents}

--${boundary}--
`;

  // tslint:disable-next-line:no-console
  console.log('@updateFile', meta, body);

  return new Promise((resolve, reject) => {
    gapi.client
      .request({
        path: 'https://www.googleapis.com/upload/drive/v3/files/' + currId,
        method: 'PATCH',
        params: {
          uploadType: 'multipart'
        },
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      })
      .then(response => {
        if (response.status !== 200) {
          reject(response);
        } else {
          resolve();
        }
      })
      .catch(reason => {
        // tslint:disable-next-line:no-console
        console.error(reason);
      });
  });
}

export function* storageSaga(): SagaIterator {
  yield takeLatest(actionTypes.HANDLE_ACCESS_TOKEN, function*(
    action: ActionType<typeof actions.handleAccessToken>
  ) {
    function clearLocationHash() {
      history.pushState(null, '', window.location.href.split('#')[0]);
    }

    const accessToken = action.payload;
    if (accessToken !== undefined || accessToken !== '') {
      clearLocationHash();
      yield call(showSuccessMessage, `Successfully link to Google Drive!`, 1000);
    } else {
      yield call(showWarningMessage, `Failed to link to Google Drive`, 1000);
    }
  });

  yield takeEvery(actionTypes.OPEN_FILE, function*(action: ActionType<typeof actions.openFile>) {
    const token = yield select((state: IState) => state.session.storageToken);
    const filename = action.payload.filename;
    const fileId = action.payload.fileId;
    currName = filename;
    currId = fileId;
    yield ensureInitialized(token);

    const meta = yield gapi.client.drive.files
      .get({ fileId, fields: 'appProperties' })
      .then(r => JSON.parse(r.body));
    const contents = yield gapi.client.drive.files.get({ fileId, alt: 'media' });
    yield put(actions.updateEditorValue(contents.body, 'playground'));
    yield put(
      actions.chapterSelect(parseInt(meta.appProperties.chapter, 10), 'default', 'playground')
    );

    yield call(showSuccessMessage, `Loaded ${filename}!`, 1000);
  });

  yield takeLatest(actionTypes.OPEN_PICKER, function*() {
    const token = yield select((state: IState) => state.session.storageToken);

    yield new Promise((res, rej) => {
      gapi.load('picker', res);
    });

    const { fileId, filename } = yield new Promise((res, rej) => {
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
      view.setOwnedByMe(true);
      view.setIncludeFolders(true);
      view.setMode(google.picker.DocsViewMode.LIST);

      // bug in @types/google.picker
      // @ts-ignore
      view.setMimeTypes(MIME_SOURCE);

      const picker = new google.picker.PickerBuilder()
        .setTitle('Source Academy')
        .addView(view)
        .setSelectableMimeTypes(MIME_SOURCE)
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setCallback((data: any) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            res({ fileId: data.docs[0].id, filename: data.docs[0].name });
          }
        })
        .build();
      picker.setVisible(true);
    });
    yield put(actions.openFile(fileId, filename));
  });

  yield takeEvery(actionTypes.SAVE_TO_DRIVE, function*() {
    const code = yield select((state: IState) => state.workspaces.playground.editorValue);
    const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter);
    const variant = yield select((state: IState) => state.workspaces.playground.context.variant);
    const external = yield select((state: IState) => state.workspaces.playground.externalLibrary);
    const token = yield select((state: IState) => state.session.storageToken);
    const defaultFileName = 'Untitled.source';
    const filename = prompt('What would you like to save our file as?', defaultFileName);

    if (filename !== null) {
      yield ensureInitialized(token);

      const file: IFile = {
        path: [filename],
        type: 'file'
      };

      const config: IPlaygroundConfig = {
        chapter,
        variant,
        external
      };

      yield createFile(file, null, MIME_SOURCE, code, config);
      yield call(showSuccessMessage, `File successfully uploaded to Google Drive!`, 1000);
    }
  });

  // todo
  yield takeEvery(actionTypes.UPDATE_TO_DRIVE, function*() {
    const code = yield select((state: IState) => state.workspaces.playground.editorValue);
    const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter);
    const variant = yield select((state: IState) => state.workspaces.playground.context.variant);
    const external = yield select((state: IState) => state.workspaces.playground.externalLibrary);
    const token = yield select((state: IState) => state.session.storageToken);

    yield ensureInitialized(token);

    const config: IPlaygroundConfig = {
      chapter,
      variant,
      external
    };

    if (currId !== '') {
      yield updateFile(null, MIME_SOURCE, code, config);
      yield call(showSuccessMessage, `File successfully updated to Google Drive!`, 1000);
    } else {
      yield call(showWarningMessage, `Please open a file first`, 1000);
    }
  });
}

export default storageSaga;
