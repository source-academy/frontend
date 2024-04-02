import { Intent } from '@blueprintjs/core';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { GoogleOAuthProvider, SuccessTokenResponse } from 'google-oauth-gsi';
import { Chapter, Variant } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
  PERSISTENCE_CREATE_FILE,
  PERSISTENCE_CREATE_FOLDER,
  PERSISTENCE_DELETE_FILE,
  PERSISTENCE_DELETE_FOLDER,
  PERSISTENCE_INITIALISE,
  PERSISTENCE_OPEN_PICKER,
  PERSISTENCE_RENAME_FILE,
  PERSISTENCE_RENAME_FOLDER,
  PERSISTENCE_SAVE_ALL,
  PERSISTENCE_SAVE_FILE,
  PERSISTENCE_SAVE_FILE_AS,
  PersistenceFile
} from '../../features/persistence/PersistenceTypes';
import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { LOGIN_GOOGLE, LOGOUT_GOOGLE } from '../application/types/SessionTypes';
import { retrieveFilesInWorkspaceAsRecord, rmFilesInDirRecursively, writeFileRecursively } from '../fileSystem/FileSystemUtils';
import { refreshFileView } from '../fileSystemView/FileSystemViewList'; // TODO broken when folder is open when reading folders
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
import { WORKSPACE_BASE_PATHS } from 'src/pages/fileSystem/createInBrowserFileSystem';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES =
  'profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive';
const UPLOAD_PATH = 'https://www.googleapis.com/upload/drive/v3/files';
const USER_INFO_PATH = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Special ID value for the Google Drive API.
const ROOT_ID = 'root';

const MIME_SOURCE = 'text/plain';
// const MIME_FOLDER = 'application/vnd.google-apps.folder';

// GIS Token Client
let googleProvider: GoogleOAuthProvider;
// Login function
function* googleLogin() {
  try {
    const tokenResp: SuccessTokenResponse = yield new Promise<SuccessTokenResponse>(
      (resolve, reject) => {
        googleProvider.useGoogleLogin({
          flow: 'implicit',
          onSuccess: resolve,
          onError: reject,
          scope: SCOPES
        })();
      }
    );
    yield call(handleUserChanged, tokenResp.access_token);
  } catch (ex) {
    console.error(ex);
  }
}

export function* persistenceSaga(): SagaIterator {
  yield takeLatest(LOGOUT_GOOGLE, function* (): any {
    yield put(actions.playgroundUpdatePersistenceFile(undefined));
    yield call(ensureInitialised);
    yield call(gapi.client.setToken, null);
    yield put(actions.removeGoogleUserAndAccessToken());
  });

  yield takeLatest(LOGIN_GOOGLE, function* (): any {
    yield call(ensureInitialised);
    yield call(googleLogin);
  });

  yield takeEvery(PERSISTENCE_INITIALISE, function* (): any {
    yield call(ensureInitialised);
    // check for stored token
    const accessToken = yield select((state: OverallState) => state.session.googleAccessToken);
    if (accessToken) {
      yield call(gapi.client.setToken, { access_token: accessToken });
      yield call(handleUserChanged, accessToken);
    }
  });

  yield takeLatest(PERSISTENCE_OPEN_PICKER, function* (): any {
    let toastKey: string | undefined;
    try {
      yield call(ensureInitialisedAndAuthorised);
      const { id, name, mimeType, picked, parentId } = yield call(pickFile, 
        'Pick a file/folder to open', 
        {
          pickFolders: true
        }
        ); // id, name, picked gotten here

      yield call(console.log, parentId);
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

      // Note: for mimeType, text/plain -> file, application/vnd.google-apps.folder -> folder

      if (mimeType === "application/vnd.google-apps.folder") { // handle folders
        toastKey = yield call(showMessage, {
          message: 'Opening folder...',
          timeout: 0,
          intent: Intent.PRIMARY
        });
        
        const fileList = yield call(getFilesOfFolder, id, name); // this needed the extra scope mimetypes to have every file
        // TODO: add type for each resp?
        yield call(console.log, "fileList", fileList);



        const fileSystem: FSModule | null = yield select(
          (state: OverallState) => state.fileSystem.inBrowserFileSystem
        );
        // If the file system is not initialised, do nothing.
        if (fileSystem === null) {
          yield call(console.log, "no filesystem!");
          return;
        }
        yield call(console.log, "there is a filesystem");

        // rm everything TODO replace everything hardcoded with playground?
        yield call(rmFilesInDirRecursively, fileSystem, "/playground");

        // clear all persistence files
        yield call(store.dispatch, actions.deleteAllPersistenceFiles());

        for (const currFile of fileList) {
          yield put(actions.addPersistenceFile({ id: currFile.id, parentId: currFile.parentId, name: currFile.name, path: "/playground" + currFile.path, lastSaved: new Date() }));
          const contents = yield call([gapi.client.drive.files, 'get'], { fileId: currFile.id, alt: 'media' });
          yield call(writeFileRecursively, fileSystem, "/playground" + currFile.path, contents.body);
          yield call(showSuccessMessage, `Loaded file ${currFile.path}.`, 1000);
        }

        // set source to chapter 4 TODO is there a better way of handling this
        yield put(
          actions.chapterSelect(
            parseInt('4', 10) as Chapter, 
            Variant.DEFAULT,
            'playground'
          )
        );
        // open folder mode
        yield call(store.dispatch, actions.setFolderMode("playground", true));

        // DDDDDDDDDDDDDDDebug
        const test = yield select((state: OverallState) => state.fileSystem.persistenceFileArray);
        yield call(console.log, test);

        // refresh needed
        yield call(store.dispatch, actions.removeEditorTabsForDirectory("playground", WORKSPACE_BASE_PATHS["playground"])); // TODO hardcoded
        // TODO find a file to open instead of deleting all active tabs?
        // TODO without modifying WorkspaceReducer in one function this would cause errors - called by onChange of Playground.tsx?
        // TODO change behaviour of WorkspaceReducer to not create program.js every time folder mode changes with 0 tabs existing?
        yield call(refreshFileView); // refreshes folder view TODO super jank?

        yield call(showSuccessMessage, `Loaded folder ${name}.`, 1000);

        // TODO does not update playground on loading folder
        yield call(console.log, "ahfdaskjhfkjsadf", parentId);
        yield put(actions.playgroundUpdatePersistenceFolder({ id, name, parentId, lastSaved: new Date() }));

        return;
      }

      toastKey = yield call(showMessage, {
        message: 'Opening file...',
        timeout: 0,
        intent: Intent.PRIMARY
      });

      const { result: meta } = yield call([gapi.client.drive.files, 'get'], { // get fileid here using gapi.client.drive.files
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
      yield put(actions.updateEditorValue('playground', activeEditorTabIndex, contents.body)); // CONTENTS OF SELECTED FILE LOADED HERE
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

      const saveToDir: PersistenceFile = pickedDir.picked // TODO is there a better way?
        ? {...pickedDir}
        : { id: ROOT_ID, name: 'My Drive'};

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

  yield takeEvery( // TODO work on this
    PERSISTENCE_SAVE_ALL,
    function* () {
      // TODO: when top level folder is renamed, save all just leaves the old folder alone and saves in a new folder if it exists
      //       Add checking to see if current folder already exists when renamed?
      //       Some way to keep track of when files/folders are renamed???????????
      // TODO: if top level folder already exists in GDrive, to 

      // Case init: Don't care, delete everything in remote and save again
      // Callable only if persistenceObject isFolder
      const [currFolderObject] = yield select( // TODO resolve type here?
        (state: OverallState) => [
          state.playground.persistenceFile
        ]
      );
      if (!currFolderObject) {
        yield call(console.log, "no obj!");
        return;
      }
      if (!(currFolderObject as PersistenceFile).isFolder) {
        yield call(console.log, "folder not opened!");
        return;
      }

      

      console.log("currFolderObj", currFolderObject);

      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );
      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        yield call(console.log, "no filesystem!");
        return;
      }
      yield call(console.log, "there is a filesystem");

      const currFiles: Record<string, string> = yield call(retrieveFilesInWorkspaceAsRecord, "playground", fileSystem);
      // TODO this does not get bare folders, is it a necessity?
      // behaviour of open folder for GDrive loads even empty folders
      yield call(console.log, "currfiles", currFiles);

      const [chapter, variant, external] = yield select(
        (state: OverallState) => [
          state.workspaces.playground.context.chapter,
          state.workspaces.playground.context.variant,
          state.workspaces.playground.externalLibrary
        ]
      );
      const config: IPlaygroundConfig = {
        chapter,
        variant,
        external
      };

      // check if top level folder has been renamed
      // assuming only 1 top level folder exists, so get 1 file
      const testPath = Object.keys(currFiles)[0];
      const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(testPath);
      if (regexResult === null) {
        yield call(console.log, "Regex null!");
        return; // should never come here
      }
      const topLevelFolderName = regexResult[1].slice(
        ("/playground/").length, -1).split("/")[0]; // TODO assuming only the top level folder exists, change?
      
      if (topLevelFolderName === "") {
        yield call(console.log, "no top level folder?");
        return;
      }

      if (topLevelFolderName !== currFolderObject.name) {
        // top level folder name has been renamed
        yield call(console.log, "TLFN changed from ", currFolderObject.name, " to ", topLevelFolderName);
        const newTopLevelFolderId: string = yield call(getContainingFolderIdRecursively, [topLevelFolderName],
          currFolderObject.parentId!); // try and find the folder if it exists
        currFolderObject.name = topLevelFolderName; // so that the new top level folder will be created below
        currFolderObject.id = newTopLevelFolderId; // so that new top level folder will be saved in root of gdrive
      }
      const persistenceFileArray: PersistenceFile[] = yield select((state: OverallState) => state.fileSystem.persistenceFileArray);
      //const fileNameRegex = new RegExp('@"[^\\]+$"');
      for (const currFullFilePath of Object.keys(currFiles)) {
        // TODO assuming current files have not been renamed at all - to implement: rename/create/delete files instantly
        const currFileContent = currFiles[currFullFilePath];
        const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(currFullFilePath);
        if (regexResult === null) {
          yield call(console.log, "Regex null!");
          continue;
        }
        const currFileName = regexResult[2] + regexResult[3];
        //const currFileParentFolders: string[] = regexResult[1].slice(
        //  ("/playground/" + currFolderObject.name + "/").length, -1)
        //  .split("/");

        // /fold1/ becomes ["fold1"]
        // /fold1/fold2/ becomes ["fold1", "fold2"]
        // If in top level folder, becomes [""]

        const currPersistenceFile = persistenceFileArray.find(e => e.path === currFullFilePath);
        if (currPersistenceFile === undefined) {
          yield call(console.log, "error");
          return;
        }
        const currFileId = currPersistenceFile.id!;
        const currFileParentFolderId = currPersistenceFile.parentId!;
        
        //const currFileParentFolderId: string = yield call(getContainingFolderIdRecursively, currFileParentFolders,
        //  currFolderObject.id);

        yield call (console.log, "name", currFileName, "content", currFileContent
        , "parent folder id", currFileParentFolderId);
        

        //const currFileId: string = yield call(getFileFromFolder, currFileParentFolderId, currFileName);

        //if (currFileId === "") {
          // file does not exist, create file
          // TODO: should never come here
          //yield call(console.log, "creating ", currFileName);
          //yield call(createFile, currFileName, currFileParentFolderId, MIME_SOURCE, currFileContent, config);

        yield call(console.log, "updating ", currFileName, " id: ", currFileId);
        yield call(updateFile, currFileId, currFileName, MIME_SOURCE, currFileContent, config);
        
        currPersistenceFile.lastSaved = new Date();
        yield put(actions.addPersistenceFile(currPersistenceFile));

        yield put(actions.playgroundUpdatePersistenceFolder({ id: currFolderObject.id, name: currFolderObject.name, parentId: currFolderObject.parentId, lastSaved: new Date() })); // TODO wut is this
        yield call(showSuccessMessage, `${currFileName} successfully saved to Google Drive.`, 1000);

        // TODO: create getFileIdRecursively, that uses currFileParentFolderId
        //         to query GDrive api to get a particular file's GDrive id OR modify reading func to save each obj's id somewhere
        //       Then use updateFile like in persistence_save_file to update files that exist
        //         on GDrive, or createFile if the file doesn't exist

        // TODO: lazy loading of files?
        //         just show the folder structure, then load the file - to turn into an issue
      }

      // Ddededededebug
      const t: PersistenceFile[] = yield select((state: OverallState) => state.fileSystem.persistenceFileArray);
      yield call(console.log, t);

      
      // Case 1: Open picker to select location for saving, similar to save all
      // 1a No folder exists on remote, simple save
      // 1b Folder exists, popup confirmation to destroy remote folder and replace

      // Case 2: Location already decided (PersistenceObject exists with isFolder === true)
      // TODO: Modify functions here to update string[] in persistenceObject for Folder
      // 2a No changes to folder/file structure, only content needs updating
      // TODO Maybe update the colors of the side view as well to reflect which have been modified?
      // 2b Changes to folder/file structure -> Delete and replace changed files
    }
  );

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

  yield takeEvery(
    PERSISTENCE_CREATE_FILE,
    function* ({ payload }: ReturnType<typeof actions.persistenceCreateFile>) {
      const newFilePath = payload;
      yield call(console.log, "create file ", newFilePath);
    }
  );

  yield takeEvery(
    PERSISTENCE_CREATE_FOLDER,
    function* ({ payload }: ReturnType<typeof actions.persistenceCreateFolder>) {
      const newFolderPath = payload;
      yield call(console.log, "create folder ", newFolderPath);
    }
  );

  yield takeEvery(
    PERSISTENCE_DELETE_FILE,
    function* ({ payload }: ReturnType<typeof actions.persistenceDeleteFile>) {
      const filePath = payload;
      yield call(console.log, "delete file ", filePath);
    }
  );

  yield takeEvery(
    PERSISTENCE_DELETE_FOLDER,
    function* ({ payload }: ReturnType<typeof actions.persistenceDeleteFolder>) {
      const folderPath = payload;
      yield call(console.log, "delete folder ", folderPath);
    }
  )

  yield takeEvery(
    PERSISTENCE_RENAME_FILE,
    function* ({ payload : {oldFilePath, newFilePath} }: ReturnType<typeof actions.persistenceRenameFile>) {
      yield call(console.log, "rename file ", oldFilePath, " to ", newFilePath);
    }
  );

  yield takeEvery(
    PERSISTENCE_RENAME_FOLDER,
    function* ({ payload : {oldFolderPath, newFolderPath} }: ReturnType<typeof actions.persistenceRenameFolder>) {
      yield call(console.log, "rename folder ", oldFolderPath, " to ", newFolderPath);
    }
  );
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

// only called once
async function initialise() {
  // initialize GIS client
  await new Promise<void>(
    (resolve, reject) =>
      (googleProvider = new GoogleOAuthProvider({
        clientId: Constants.googleClientId!,
        onScriptLoadSuccess: resolve,
        onScriptLoadError: reject
      }))
  );

  // load and initialize gapi.client
  await new Promise<void>((resolve, reject) =>
    gapi.load('client', {
      callback: resolve,
      onerror: reject
    })
  );
  await gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS
  });
}

function* handleUserChanged(accessToken: string | null) {
  if (accessToken === null) {
    yield put(actions.removeGoogleUserAndAccessToken());
  } else {
    const email: string | undefined = yield call(getUserProfileDataEmail);
    if (!email) {
      yield put(actions.removeGoogleUserAndAccessToken());
    } else {
      yield put(store.dispatch(actions.setGoogleUser(email)));
      yield put(store.dispatch(actions.setGoogleAccessToken(accessToken)));
    }
  }
}

function* ensureInitialised() {
  startInitialisation();
  yield initialisationPromise;
}

// called multiple times
function* ensureInitialisedAndAuthorised() {
  yield call(ensureInitialised);
  const currToken: GoogleApiOAuth2TokenObject = yield call(gapi.client.getToken);

  if (currToken === null) {
    yield call(googleLogin);
  } else {
    // check if loaded token is still valid
    const email: string | undefined = yield call(getUserProfileDataEmail);
    const isValid = email ? true : false;
    if (!isValid) {
      yield call(googleLogin);
    }
  }
}

function getUserProfileDataEmail(): Promise<string | undefined> {
  return gapi.client
    .request({
      path: USER_INFO_PATH
    })
    .then(r => r.result.email)
    .catch(() => undefined);
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
        .setOAuthToken(gapi.client.getToken().access_token)
        .setAppId(Constants.googleAppId!)
        .setDeveloperKey(Constants.googleApiKey!)
        .setCallback((data: any) => {
          switch (data[google.picker.Response.ACTION]) {
            case google.picker.Action.PICKED: {
              console.log("data", data);
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

async function getFilesOfFolder( // recursively get files
  folderId: string,
  currFolderName: string,
  currPath: string = '' // pass in name of folder picked
) {
  console.log(folderId, currPath, currFolderName);
  let fileList: gapi.client.drive.File[] | undefined;
  
  await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed = false`
  }).then(res => {
    fileList = res.result.files
  });

  console.log("fileList", fileList);

  if (!fileList || fileList.length === 0) {
    return [{
      name: currFolderName,
      id: folderId,
      path: currPath + '/' + currFolderName,
      isFile: false
    }];
  }


  let ans: any[] = []; // TODO: add type for each resp?
  for (const currFile of fileList) {
    if (currFile.mimeType === "application/vnd.google-apps.folder") { // folder
      ans = ans.concat(await 
        getFilesOfFolder(currFile.id!, currFile.name!, currPath + '/' + currFolderName)
      );
    } 
    else { // file
      console.log("found file " + currFile.name);
      ans.push({
        name: currFile.name,
        id: currFile.id,
        parentId: folderId,
        path: currPath + '/' + currFolderName + '/' + currFile.name,
        isFile: true
      });
    } 
  }

  return ans;
}

/*
async function getFileFromFolder( // returns string id or empty string if failed
  parentFolderId: string,
  fileName: string
): Promise<string> {
  let fileList: gapi.client.drive.File[] | undefined;

  await gapi.client.drive.files.list({
    q: '\'' + parentFolderId + '\'' + ' in parents and trashed = false and name = \'' + fileName + '\'',
  }).then(res => {
    fileList = res.result.files
  })

  console.log(fileList);

  if (!fileList || fileList.length === 0) {
    // file does not exist
    console.log("file not exist: " + fileName);
    return "";
  }

  //check if file is correct
  if (fileList![0].name === fileName) {
    // file is correct
    return fileList![0].id!;
  } else {
    return "";
  }
}
*/

async function getContainingFolderIdRecursively( // TODO memoize?
  parentFolders: string[],
  topFolderId: string,
  currDepth: integer = 0
): Promise<string> {
  if (parentFolders[0] === '' || currDepth === parentFolders.length) {
    return topFolderId;
  }
  const currFolderName = parentFolders[parentFolders.length - 1 - currDepth];

  const immediateParentFolderId = await getContainingFolderIdRecursively(
    parentFolders,
    topFolderId,
    currDepth + 1
    );

  let folderList: gapi.client.drive.File[] | undefined;

  await gapi.client.drive.files.list({
    q: `'${immediateParentFolderId}' in parents and trashed = false and mimeType = '`
       + 'application/vnd.google-apps.folder\''
  }).then(res => {
    folderList = res.result.files
  });

  if (!folderList) {
    console.log("create!", currFolderName);
    const newId = await createFolderAndReturnId(immediateParentFolderId, currFolderName);
    return newId;
  }

  console.log("folderList gcfir", folderList);

  for (const currFolder of folderList) {
    if (currFolder.name === currFolderName) {
      console.log("found ", currFolder.name, " and id is ", currFolder.id);
      return currFolder.id!;
    }
  }
  
  console.log("create!", currFolderName);
  const newId = await createFolderAndReturnId(immediateParentFolderId, currFolderName);
  return newId;
  
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
    parents: [parent], //[id of the parent folder as a string]
    appProperties: {
      source: true,
      ...config
    }
  };

  console.log("METATAAAAAA", meta);

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
    .then(({ result }) => ({ id: result.id, name: result.name, isFile: true }));
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

  console.log("META", meta);

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

function createFolderAndReturnId(
  parentFolderId: string,
  folderName: string
): Promise<string> {
  const name = folderName;
  const mimeType = 'application/vnd.google-apps.folder';
  const meta = {
    name,
    mimeType,
    parents: [parentFolderId], //[id of the parent folder as a string]
  }

  const { body, headers } = createMultipartBody(meta, '', mimeType);
  
  return gapi.client
  .request({
    path: UPLOAD_PATH,
    method: 'POST',
    params: {
      uploadType: 'multipart'
    },
    headers,
    body
  }).then(res => res.result.id)
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
