import { Intent } from '@blueprintjs/core';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter, Variant } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import { WORKSPACE_BASE_PATHS } from 'src/pages/fileSystem/createInBrowserFileSystem';

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
import { LOGIN_GOOGLE, LOGOUT_GOOGLE } from '../application/types/SessionTypes';
import {
  isGithubSyncing,
  retrieveFilesInWorkspaceAsRecord,
  rmFilesInDirRecursively,
  writeFileRecursively
} from '../fileSystem/FileSystemUtils';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import {
  showSimpleConfirmDialog,
  showSimpleErrorDialog,
  showSimplePromptDialog
} from '../utils/DialogHelper';
import {
  dismiss,
  showMessage,
  showSuccessMessage,
  showWarningMessage
} from '../utils/notifications/NotificationsHelper';
import { areAllFilesSavedGoogleDrive, filePathRegex } from '../utils/PersistenceHelper';
import { AsyncReturnType } from '../utils/TypeHelper';
import { EditorTabState } from '../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery, safeTakeLatest as takeLatest } from './SafeEffects';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES =
  'profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive';
const UPLOAD_PATH = 'https://www.googleapis.com/upload/drive/v3/files';
const USER_INFO_PATH = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Special ID value for the Google Drive API.
const ROOT_ID = 'root';

const MIME_SOURCE = 'text/plain';
const MIME_FOLDER = 'application/vnd.google-apps.folder';

// GIS Token Client
let tokenClient: google.accounts.oauth2.TokenClient;

export function* persistenceSaga(): SagaIterator {
  yield takeLatest(LOGOUT_GOOGLE, function* (): any {
    yield put(actions.playgroundUpdatePersistenceFile(undefined));
    yield call(store.dispatch, actions.deleteAllPersistenceFiles());
    yield call(ensureInitialised);
    yield call(gapi.client.setToken, null);
    yield put(actions.removeGoogleUserAndAccessToken());
  });

  yield takeLatest(LOGIN_GOOGLE, function* (): any {
    yield call(ensureInitialised);
    yield call(getToken);
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
      // Make sure access token is valid
      yield call(ensureInitialisedAndAuthorised);
      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );
      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        throw new Error('No filesystem!');
      }
      const { id, name, mimeType, picked, parentId } = yield call(
        pickFile,
        'Pick a file/folder to open',
        {
          pickFolders: true
        }
      );

      if (!picked) {
        return;
      }

      const confirmOpen: boolean = yield call(showSimpleConfirmDialog, {
        title: 'Opening from Google Drive',
        contents: (
          <p>
            Opening <strong>{name}</strong> will overwrite the current contents of your workspace.
            All local files/folders will be deleted. Are you sure?
          </p>
        ),
        positiveLabel: 'Open',
        negativeLabel: 'Cancel'
      });
      if (!confirmOpen) {
        return;
      }

      yield call(store.dispatch, actions.disableFileSystemContextMenus());

      // User picked a folder to open
      if (mimeType === MIME_FOLDER) {
        toastKey = yield call(showMessage, {
          message: 'Opening folder...',
          timeout: 0,
          intent: Intent.PRIMARY
        });

        // Get all files that are children of the picked folder from GDrive API
        const fileList = yield call(getFilesOfFolder, id, name); // this needed the extra scope mimetypes to have every file

        // Delete everything in browserFS and persistenceFileArray
        yield call(rmFilesInDirRecursively, fileSystem, '/playground');
        yield call(store.dispatch, actions.deleteAllPersistenceFiles());

        // Add top level root folder to persistenceFileArray
        yield put(
          actions.addPersistenceFile({
            id,
            parentId,
            name,
            path: '/playground/' + name,
            isFolder: true
          })
        );

        yield call(store.dispatch, actions.updateRefreshFileViewKey());

        for (const currFile of fileList) {
          if (currFile.isFolder === true) {
            // Add folder to persistenceFileArray
            yield put(
              actions.addPersistenceFile({
                id: currFile.id,
                parentId: currFile.parentId,
                name: currFile.name,
                path: '/playground' + currFile.path,
                isFolder: true
              })
            );
            // Add empty folder to BrowserFS
            yield call(
              writeFileRecursively,
              fileSystem,
              '/playground' + currFile.path + '/dummy', // workaround to make empty folders
              '',
              true
            );
            yield call(store.dispatch, actions.updateRefreshFileViewKey());
            continue;
          }

          // currFile is a file
          // Add file to persistenceFileArray
          yield put(
            actions.addPersistenceFile({
              id: currFile.id,
              parentId: currFile.parentId,
              name: currFile.name,
              path: '/playground' + currFile.path,
              lastSaved: new Date()
            })
          );
          // Get contents of file
          const contents = yield call([gapi.client.drive.files, 'get'], {
            fileId: currFile.id,
            alt: 'media'
          });
          // Write contents of file to BrowserFS
          yield call(
            writeFileRecursively,
            fileSystem,
            '/playground' + currFile.path,
            contents.body
          );
          yield call(showSuccessMessage, `Loaded file ${currFile.path}.`, 1000);
          yield call(store.dispatch, actions.updateRefreshFileViewKey());
        }

        // Set source to chapter 4 TODO hardcoded
        yield put(
          actions.chapterSelect(parseInt('4', 10) as Chapter, Variant.DEFAULT, 'playground')
        );

        // Close all editor tabs
        yield call(
          store.dispatch,
          actions.removeEditorTabsForDirectory('playground', WORKSPACE_BASE_PATHS['playground'])
        );

        // Update playground PersistenceFile with entry representing top level root folder
        yield put(
          actions.playgroundUpdatePersistenceFile({
            id,
            name,
            parentId,
            lastSaved: new Date(),
            isFolder: true
          })
        );

        // Delay to increase likelihood addPersistenceFile for last loaded file has completed
        // and for the toasts to not overlap
        yield call(() => new Promise(resolve => setTimeout(resolve, 1000)));
        yield call(showSuccessMessage, `Loaded folder ${name}.`, 1000);
        return;
      }

      // Below is for handling opening of single files
      toastKey = yield call(showMessage, {
        message: 'Opening file...',
        timeout: 0,
        intent: Intent.PRIMARY
      });

      // Get content of chosen file
      const contents = yield call([gapi.client.drive.files, 'get'], { fileId: id, alt: 'media' });

      // Delete everything in BrowserFS and persistenceFileArray
      yield call(rmFilesInDirRecursively, fileSystem, '/playground');
      yield call(store.dispatch, actions.deleteAllPersistenceFiles());

      // Write file to BrowserFS
      yield call(writeFileRecursively, fileSystem, '/playground/' + name, contents.body);
      // Update playground PersistenceFile
      const newPersistenceFile = { id, name, lastSaved: new Date(), path: '/playground/' + name };
      yield put(actions.playgroundUpdatePersistenceFile(newPersistenceFile));
      // Add file to persistenceFileArray
      yield put(actions.addPersistenceFile(newPersistenceFile));
      // Close all editor tabs
      yield call(
        store.dispatch,
        actions.removeEditorTabsForDirectory('playground', WORKSPACE_BASE_PATHS['playground'])
      );

      // Delay to increase likelihood addPersistenceFile for last loaded file has completed
      // and for the toasts to not overlap
      yield call(() => new Promise(resolve => setTimeout(resolve, 1000)));
      yield call(showSuccessMessage, `Loaded ${name}.`, 1000);
    } catch (ex) {
      console.error(ex);
      yield call(showWarningMessage, `Error while opening file/folder.`, 1000);
    } finally {
      if (toastKey) {
        dismiss(toastKey);
      }
      yield call(store.dispatch, actions.enableFileSystemContextMenus());
      yield call(store.dispatch, actions.updateRefreshFileViewKey());
    }
  });

  yield takeLatest(PERSISTENCE_SAVE_FILE_AS, function* (): any {
    let toastKey: string | undefined;

    const persistenceFileArray: PersistenceFile[] = yield select(
      (state: OverallState) => state.fileSystem.persistenceFileArray
    );
    const [currPersistenceFile] = yield select((state: OverallState) => [
      state.playground.persistenceFile
    ]);
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
        yield call(showWarningMessage, `Please open an editor tab.`, 1000);
        return;
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

      // If user picked a folder, use id of that picked folder
      // Else use special root id representing root of GDrive
      const saveToDir: PersistenceFile = pickedDir.picked
        ? { ...pickedDir }
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
        // User will overwrite an existing file
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

        yield call(store.dispatch, actions.disableFileSystemContextMenus());

        const [chapter, variant, external] = yield select((state: OverallState) => [
          state.workspaces.playground.context.chapter,
          state.workspaces.playground.context.variant,
          state.workspaces.playground.externalLibrary
        ]);
        const config: IPlaygroundConfig = {
          chapter,
          variant,
          external
        };
        // Case: User is currently syncing a folder and user wants to overwrite an existing file
        if (currPersistenceFile && currPersistenceFile.isFolder) {
          // Check if overwritten file is within synced folder
          // If it is, update its entry in persistenceFileArray and contents in BrowserFS
          const localFileTarget = persistenceFileArray.find(e => e.id === pickedFile.id);
          if (localFileTarget) {
            toastKey = yield call(showMessage, {
              message: `Saving as ${localFileTarget.name}...`,
              timeout: 0,
              intent: Intent.PRIMARY
            });
            const fileSystem: FSModule | null = yield select(
              (state: OverallState) => state.fileSystem.inBrowserFileSystem
            );
            if (fileSystem === null) {
              throw new Error('No filesystem');
            }

            yield call(
              updateFile,
              localFileTarget.id,
              localFileTarget.name,
              MIME_SOURCE,
              code,
              config
            );

            yield put(
              actions.addPersistenceFile({
                ...localFileTarget,
                lastSaved: new Date(),
                lastEdit: undefined
              })
            );
            yield call(writeFileRecursively, fileSystem, localFileTarget.path!, code);
            yield call(store.dispatch, actions.updateRefreshFileViewKey());

            // Check if all files are now updated
            // If they are, update lastSaved if playgroundPersistenceFile
            const updatedPersistenceFileArray: PersistenceFile[] = yield select(
              (state: OverallState) => state.fileSystem.persistenceFileArray
            );
            if (areAllFilesSavedGoogleDrive(updatedPersistenceFileArray)) {
              yield put(
                actions.playgroundUpdatePersistenceFile({
                  id: currPersistenceFile.id,
                  name: currPersistenceFile.name,
                  parentId: currPersistenceFile.parentId,
                  lastSaved: new Date(),
                  isFolder: true
                })
              );
            }
            // Check if any editor tab is that updated file, and update contents
            const targetEditorTabIndex = (editorTabs as EditorTabState[]).findIndex(
              e => e.filePath === localFileTarget.path!
            );
            if (targetEditorTabIndex !== -1) {
              yield put(actions.updateEditorValue('playground', targetEditorTabIndex, code));
            }
          } else {
            // User overwriting file outside synced folder
            yield call(updateFile, pickedFile.id, pickedFile.name, MIME_SOURCE, code, config);
          }
          yield call(
            showSuccessMessage,
            `${pickedFile.name} successfully saved to Google Drive.`,
            1000
          );
          return;
        }

        // Chose to overwrite file - user syncing single file
        // Checks if user chose to overwrite the synced file for whatever reason
        // Updates the relevant PersistenceFiles
        if (currPersistenceFile && currPersistenceFile.id === pickedFile.id) {
          const newPersFile: PersistenceFile = {
            ...pickedFile,
            lastSaved: new Date(),
            path: '/playground/' + pickedFile.name
          };
          yield put(actions.playgroundUpdatePersistenceFile(newPersFile));
          yield put(actions.addPersistenceFile(newPersFile));
        }

        // Save to Google Drive
        yield call(updateFile, pickedFile.id, pickedFile.name, MIME_SOURCE, code, config);

        yield call(
          showSuccessMessage,
          `${pickedFile.name} successfully saved to Google Drive.`,
          1000
        );
      } else {
        // Saving as a new file branch
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

        const newFile: PersistenceFile = yield call(
          createFile,
          response.value,
          saveToDir.id,
          MIME_SOURCE,
          code,
          config
        );

        //Case: Chose to save as a new file, and user is syncing a folder
        if (currPersistenceFile && currPersistenceFile.isFolder) {
          //Check if user saved a new file somewhere within the synced folder
          let needToUpdateLocal = false;
          let localFolderTarget: PersistenceFile;
          for (let i = 0; i < persistenceFileArray.length; i++) {
            if (persistenceFileArray[i].isFolder && persistenceFileArray[i].id === saveToDir.id) {
              needToUpdateLocal = true;
              localFolderTarget = persistenceFileArray[i];
              break;
            }
          }

          if (needToUpdateLocal) {
            // Adds new file entry to persistenceFileArray
            const fileSystem: FSModule | null = yield select(
              (state: OverallState) => state.fileSystem.inBrowserFileSystem
            );
            if (fileSystem === null) {
              throw new Error('No filesystem');
            }
            const newPath = localFolderTarget!.path + '/' + response.value;
            yield put(
              actions.addPersistenceFile({ ...newFile, lastSaved: new Date(), path: newPath })
            );
            yield call(writeFileRecursively, fileSystem, newPath, code);
            yield call(store.dispatch, actions.updateRefreshFileViewKey());
          }

          yield call(
            showSuccessMessage,
            `${response.value} successfully saved to Google Drive.`,
            1000
          );
          return;
        }

        // Case: playground PersistenceFile is in single file mode
        // Does nothing
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
      yield call(store.dispatch, actions.enableFileSystemContextMenus());
      yield call(store.dispatch, actions.updateRefreshFileViewKey());
    }
  });

  yield takeEvery(PERSISTENCE_SAVE_ALL, function* () {
    let toastKey: string | undefined;

    try {
      yield call(ensureInitialisedAndAuthorised);
      const [currFolderObject] = yield select((state: OverallState) => [
        state.playground.persistenceFile
      ]);

      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );

      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        throw new Error('No filesystem');
      }

      // Get file record from BrowserFS
      const currFiles: Record<string, string> = yield call(
        retrieveFilesInWorkspaceAsRecord,
        'playground',
        fileSystem
      );

      const [chapter, variant, external] = yield select((state: OverallState) => [
        state.workspaces.playground.context.chapter,
        state.workspaces.playground.context.variant,
        state.workspaces.playground.externalLibrary
      ]);
      const config: IPlaygroundConfig = {
        chapter,
        variant,
        external
      };

      // Case: User is NOT currently syncing a folder. Ie, either syncing single file
      // or nothing at all
      if (!currFolderObject || !(currFolderObject as PersistenceFile).isFolder) {
        // Check if there is only a single top level folder in BrowserFS
        const testPaths: Set<string> = new Set();
        let fileExistsInTopLevel = false;
        Object.keys(currFiles).forEach(e => {
          const regexResult = filePathRegex.exec(e)!;
          const testStr = regexResult![1].slice('/playground/'.length, -1).split('/')[0];
          if (testStr === '') {
            // represents a file in /playground/
            fileExistsInTopLevel = true;
          }
          testPaths.add(regexResult![1].slice('/playground/'.length, -1).split('/')[0]);
        });
        if (testPaths.size !== 1 || fileExistsInTopLevel) {
          yield call(showSimpleErrorDialog, {
            title: 'Unable to Save All',
            contents: (
              <p>
                There must be only exactly one non-empty top level folder present to use Save All.
              </p>
            ),
            label: 'OK'
          });
          return;
        }

        // Local top level folder will now be written
        // Ask user to pick a location
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
          ? { ...pickedDir }
          : { id: ROOT_ID, name: 'My Drive' };
        const topLevelFolderName = testPaths.values().next().value;
        let topLevelFolderId: string = yield call(
          getIdOfFileOrFolder,
          saveToDir.id,
          topLevelFolderName
        );

        if (topLevelFolderId !== '') {
          // Folder with same name already exists in GDrive in picked location
          const reallyOverwrite: boolean = yield call(showSimpleConfirmDialog, {
            title: 'Saving to Google Drive',
            contents: (
              <span>
                Merge <strong>{topLevelFolderName}</strong> inside <strong>{saveToDir.name}</strong>{' '}
                with your local folder? No deletions will be made remotely, only content updates,
                but new remote files may be created.
              </span>
            )
          });
          if (!reallyOverwrite) {
            return;
          }
        } else {
          // Folder with same name does not exist in GDrive in picked location
          // Create the new folder in GDrive to be used as top level folder
          const reallyCreate: boolean = yield call(showSimpleConfirmDialog, {
            title: 'Saving to Google Drive',
            contents: (
              <span>
                Create <strong>{topLevelFolderName}</strong> inside{' '}
                <strong>{saveToDir.name}</strong>?
              </span>
            )
          });
          if (!reallyCreate) {
            return;
          }
          topLevelFolderId = yield call(createFolderAndReturnId, saveToDir.id, topLevelFolderName);
        }
        toastKey = yield call(showMessage, {
          message: `Saving ${topLevelFolderName}...`,
          timeout: 0,
          intent: Intent.PRIMARY
        });
        yield call(store.dispatch, actions.disableFileSystemContextMenus());

        interface FolderIdBundle {
          id: string;
          parentId: string;
        }

        for (const currFullFilePath of Object.keys(currFiles)) {
          const currFileContent = currFiles[currFullFilePath];
          const regexResult = filePathRegex.exec(currFullFilePath)!;
          const currFileName = regexResult[2] + regexResult[3];
          const currFileParentFolders: string[] = regexResult[1]
            .slice(('/playground/' + topLevelFolderName + '/').length, -1)
            .split('/');

          // Get folder id of parent folder of currFile
          // TODO: can be optimized
          const gcfirResult: FolderIdBundle = yield call(
            getContainingFolderIdRecursively,
            currFileParentFolders,
            topLevelFolderId
          );
          const currFileParentFolderId = gcfirResult.id;

          // Check if currFile exists remotely by filename
          let currFileId: string = yield call(
            getIdOfFileOrFolder,
            currFileParentFolderId,
            currFileName
          );

          if (currFileId === '') {
            // File does not exist, create file
            const res: PersistenceFile = yield call(
              createFile,
              currFileName,
              currFileParentFolderId,
              MIME_SOURCE,
              currFileContent,
              config
            );
            currFileId = res.id;
          } else {
            // Update currFile's content
            yield call(updateFile, currFileId, currFileName, MIME_SOURCE, currFileContent, config);
          }
          const currPersistenceFile: PersistenceFile = {
            name: currFileName,
            id: currFileId,
            parentId: currFileParentFolderId,
            lastSaved: new Date(),
            path: currFullFilePath
          };
          // Add currFile's persistenceFile to persistenceFileArray
          yield put(actions.addPersistenceFile(currPersistenceFile));

          // If currParentFolderName is something, then currFile is inside top level root folder
          // If it is nothing, currFile is the top level root folder, and currParentFolderName will be ''
          let currParentFolderName = currFileParentFolders[currFileParentFolders.length - 1];
          if (currParentFolderName !== '') currParentFolderName = topLevelFolderName;
          const parentPersistenceFile: PersistenceFile = {
            name: currParentFolderName,
            id: currFileParentFolderId,
            path: regexResult[1].slice(0, -1),
            parentId: gcfirResult.parentId,
            isFolder: true
          };

          // Add the persistenceFile representing the parent folder of currFile to persistenceFileArray
          yield put(actions.addPersistenceFile(parentPersistenceFile));

          yield call(
            showSuccessMessage,
            `${currFileName} successfully saved to Google Drive.`,
            1000
          );
          yield call(store.dispatch, actions.updateRefreshFileViewKey());
        }

        // Update playground's persistenceFile
        yield put(
          actions.playgroundUpdatePersistenceFile({
            id: topLevelFolderId,
            name: topLevelFolderName,
            parentId: saveToDir.id,
            lastSaved: new Date(),
            isFolder: true
          })
        );

        yield call(
          showSuccessMessage,
          `${topLevelFolderName} successfully saved to Google Drive.`,
          1000
        );
        return;
      }

      // From here onwards, code assumes every file is contained in PersistenceFileArray
      // Instant sync for renaming/deleting/creating files/folders ensures that is the case if folder is opened
      // New files will not be created from here onwards - every operation is an update operation

      toastKey = yield call(showMessage, {
        message: `Saving ${currFolderObject.name}...`,
        timeout: 0,
        intent: Intent.PRIMARY
      });

      const persistenceFileArray: PersistenceFile[] = yield select(
        (state: OverallState) => state.fileSystem.persistenceFileArray
      );
      for (const currFullFilePath of Object.keys(currFiles)) {
        const currFileContent = currFiles[currFullFilePath];
        const regexResult = filePathRegex.exec(currFullFilePath)!;
        const currFileName = regexResult[2] + regexResult[3];

        // Check if currFile is in persistenceFileArray
        const currPersistenceFile = persistenceFileArray.find(e => e.path === currFullFilePath);
        if (currPersistenceFile === undefined) {
          throw new Error('this file is not in persistenceFileArray: ' + currFullFilePath);
        }

        // Check if currFile even needs to update - if it doesn't, skip
        if (
          !currPersistenceFile.lastEdit ||
          (currPersistenceFile.lastSaved &&
            currPersistenceFile.lastEdit < currPersistenceFile.lastSaved)
        ) {
          continue;
        }

        // Check if currFile has info on parentId - should never trigger
        if (!currPersistenceFile.id || !currPersistenceFile.parentId) {
          throw new Error('this file does not have id/parentId: ' + currFullFilePath);
        }

        // TODO: Check if currFile exists remotely by filename?
        const currFileId: string = currPersistenceFile.id;
        // Update currFile content in GDrive
        yield call(updateFile, currFileId, currFileName, MIME_SOURCE, currFileContent, config);
        // Update currFile entry in persistenceFileArray's lastSaved
        currPersistenceFile.lastSaved = new Date();
        yield put(actions.addPersistenceFile(currPersistenceFile));

        yield call(showSuccessMessage, `${currFileName} successfully saved to Google Drive.`, 1000);
      }

      // Update playground PersistenceFile's lastSaved
      yield put(
        actions.playgroundUpdatePersistenceFile({
          id: currFolderObject.id,
          name: currFolderObject.name,
          parentId: currFolderObject.parentId,
          lastSaved: new Date(),
          isFolder: true
        })
      );
      yield call(store.dispatch, actions.updateRefreshFileViewKey());
      yield call(
        showSuccessMessage,
        `${currFolderObject.name} successfully saved to Google Drive.`,
        1000
      );
    } catch (ex) {
      console.error(ex);
      yield call(showWarningMessage, `Error while performing Save All.`, 1000);
    } finally {
      if (toastKey) {
        dismiss(toastKey);
      }
      yield call(store.dispatch, actions.enableFileSystemContextMenus());
      yield call(store.dispatch, actions.updateRefreshFileViewKey());
    }
  });

  yield takeEvery(
    PERSISTENCE_SAVE_FILE,
    function* ({ payload: { id, name } }: ReturnType<typeof actions.persistenceSaveFile>) {
      // Uncallable when user is not syncing anything
      yield call(store.dispatch, actions.disableFileSystemContextMenus());
      let toastKey: string | undefined;

      const [playgroundPersistenceFile] = yield select((state: OverallState) => [
        state.playground.persistenceFile
      ]);

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

      try {
        if (activeEditorTabIndex === null) {
          if (!playgroundPersistenceFile)
            yield call(showWarningMessage, `Please have an editor tab open.`, 1000);
          else if (!playgroundPersistenceFile.isFolder) {
            yield call(
              showWarningMessage,
              `Please have ${name} open as the active editor tab.`,
              1000
            );
          } else {
            yield call(
              showWarningMessage,
              `Please have the file you want to save open as the active editor tab.`,
              1000
            );
          }
          return;
        }
        const code = editorTabs[activeEditorTabIndex].value;

        // Check if editor is correct for single file sync mode
        if (
          playgroundPersistenceFile &&
          !playgroundPersistenceFile.isFolder &&
          (editorTabs[activeEditorTabIndex] as EditorTabState).filePath !==
            playgroundPersistenceFile.path
        ) {
          yield call(
            showWarningMessage,
            `Please have ${name} open as the active editor tab.`,
            1000
          );
          return;
        }

        const config: IPlaygroundConfig = {
          chapter,
          variant,
          external
        };
        // Case: Syncing a folder
        if ((playgroundPersistenceFile as PersistenceFile).isFolder) {
          const persistenceFileArray: PersistenceFile[] = yield select(
            (state: OverallState) => state.fileSystem.persistenceFileArray
          );
          // Get persistenceFile of filepath of target file of currently focused editor tab
          const currPersistenceFile = persistenceFileArray.find(
            e => e.path === (editorTabs[activeEditorTabIndex] as EditorTabState).filePath
          );
          if (!currPersistenceFile) {
            throw new Error('Persistence file not found');
          }
          toastKey = yield call(showMessage, {
            message: `Saving as ${currPersistenceFile.name}...`,
            timeout: 0,
            intent: Intent.PRIMARY
          });
          // Update remote contents of target file
          yield call(
            updateFile,
            currPersistenceFile.id,
            currPersistenceFile.name,
            MIME_SOURCE,
            code,
            config
          );
          // Update persistenceFileArray entry of target file
          currPersistenceFile.lastSaved = new Date();
          yield put(actions.addPersistenceFile(currPersistenceFile));
          yield call(store.dispatch, actions.updateRefreshFileViewKey());
          yield call(
            showSuccessMessage,
            `${currPersistenceFile.name} successfully saved to Google Drive.`,
            1000
          );

          // Check if all files are now updated
          // If so, update playground PersistenceFile's lastSaved
          const updatedPersistenceFileArray: PersistenceFile[] = yield select(
            (state: OverallState) => state.fileSystem.persistenceFileArray
          );
          if (areAllFilesSavedGoogleDrive(updatedPersistenceFileArray)) {
            yield put(
              actions.playgroundUpdatePersistenceFile({
                id: playgroundPersistenceFile.id,
                name: playgroundPersistenceFile.name,
                parentId: playgroundPersistenceFile.parentId,
                lastSaved: new Date(),
                isFolder: true
              })
            );
          }

          return;
        }

        // Case: Not syncing a folder === syncing a single file
        toastKey = yield call(showMessage, {
          message: `Saving as ${name}...`,
          timeout: 0,
          intent: Intent.PRIMARY
        });

        // Updates file's remote contents, persistenceFileArray, playground PersistenceFile
        yield call(updateFile, id, name, MIME_SOURCE, code, config);
        const updatedPlaygroundPersFile = { ...playgroundPersistenceFile, lastSaved: new Date() };
        yield put(actions.addPersistenceFile(updatedPlaygroundPersFile));
        yield put(actions.playgroundUpdatePersistenceFile(updatedPlaygroundPersFile));
        yield call(showSuccessMessage, `${name} successfully saved to Google Drive.`, 1000);
        yield call(store.dispatch, actions.updateRefreshFileViewKey());
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while saving file.`, 1000);
      } finally {
        if (toastKey) {
          dismiss(toastKey);
        }
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_CREATE_FILE,
    function* ({ payload }: ReturnType<typeof actions.persistenceCreateFile>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());

        const newFilePath = payload;

        // Look for target file's parent folder's entry in persistenceFileArray
        const regexResult = filePathRegex.exec(newFilePath)!;
        const parentFolderPath = regexResult ? regexResult[1].slice(0, -1) : undefined;
        if (!parentFolderPath) {
          // Parent folder path not found
          return;
        }
        const newFileName = regexResult![2] + regexResult![3];
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const parentFolderPersistenceFile = persistenceFileArray.find(
          e => e.path === parentFolderPath
        );
        if (!parentFolderPersistenceFile) {
          // Parent pers file not found"
          return;
        }
        yield call(ensureInitialisedAndAuthorised);

        // Create file remotely
        const parentFolderId = parentFolderPersistenceFile.id;
        const [chapter, variant, external] = yield select((state: OverallState) => [
          state.workspaces.playground.context.chapter,
          state.workspaces.playground.context.variant,
          state.workspaces.playground.externalLibrary
        ]);
        const config: IPlaygroundConfig = {
          chapter,
          variant,
          external
        };
        const newFilePersistenceFile: PersistenceFile = yield call(
          createFile,
          newFileName,
          parentFolderId,
          MIME_SOURCE,
          '',
          config
        );

        // Add new file to persistenceFileArray
        yield put(
          actions.addPersistenceFile({
            ...newFilePersistenceFile,
            lastSaved: new Date(),
            path: newFilePath
          })
        );
        yield call(store.dispatch, actions.updateRefreshFileViewKey());
        yield call(showSuccessMessage, `${newFileName} successfully saved to Google Drive.`, 1000);
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while creating file.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_CREATE_FOLDER,
    function* ({ payload }: ReturnType<typeof actions.persistenceCreateFolder>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());
        const newFolderPath = payload;

        // Look for parent folder's entry in persistenceFileArray
        const regexResult = filePathRegex.exec(newFolderPath);
        const parentFolderPath = regexResult ? regexResult[1].slice(0, -1) : undefined;
        if (!parentFolderPath) {
          // parent missing
          return;
        }
        const newFolderName = regexResult![2];
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const parentFolderPersistenceFile = persistenceFileArray.find(
          e => e.path === parentFolderPath
        );
        if (!parentFolderPersistenceFile) {
          // parent pers file missing
          return;
        }
        yield call(ensureInitialisedAndAuthorised);

        // Create folder remotely
        const parentFolderId = parentFolderPersistenceFile.id;

        const newFolderId: string = yield call(
          createFolderAndReturnId,
          parentFolderId,
          newFolderName
        );

        // Add folder to persistenceFileArray
        yield put(
          actions.addPersistenceFile({
            lastSaved: new Date(),
            path: newFolderPath,
            id: newFolderId,
            name: newFolderName,
            parentId: parentFolderId,
            isFolder: true
          })
        );
        yield call(store.dispatch, actions.updateRefreshFileViewKey());
        yield call(
          showSuccessMessage,
          `Folder ${newFolderName} successfully saved to Google Drive.`,
          1000
        );
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while creating folder.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_DELETE_FILE,
    function* ({ payload }: ReturnType<typeof actions.persistenceDeleteFile>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());
        const filePath = payload;

        // Look for file's entry in persistenceFileArray
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const persistenceFile = persistenceFileArray.find(e => e.path === filePath);
        if (!persistenceFile || persistenceFile.id === '') {
          // Cannot find pers file
          return;
        }
        // Delete file from persistenceFileArray and GDrive
        yield call(ensureInitialisedAndAuthorised);
        yield call(deleteFileOrFolder, persistenceFile.id);
        yield put(actions.deletePersistenceFile(persistenceFile));
        yield call(store.dispatch, actions.updateRefreshFileViewKey());

        // If the user comes here in single file mode, then the file they deleted
        // must be the file they are tracking. So delete playground persistenceFile
        const [currFileObject] = yield select((state: OverallState) => [
          state.playground.persistenceFile
        ]);
        if (!currFileObject.isFolder) {
          yield put(actions.playgroundUpdatePersistenceFile(undefined));
        }

        yield call(
          showSuccessMessage,
          `${persistenceFile.name} successfully deleted from Google Drive.`,
          1000
        );
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while deleting file.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_DELETE_FOLDER,
    function* ({ payload }: ReturnType<typeof actions.persistenceDeleteFolder>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());
        const folderPath = payload;

        // Find folder's entry in persistenceFileArray
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const persistenceFile = persistenceFileArray.find(e => e.path === folderPath);
        if (!persistenceFile || persistenceFile.id === '') {
          // Cannot find pers file
          return;
        }
        // Delete folder in GDrive
        yield call(ensureInitialisedAndAuthorised);
        yield call(deleteFileOrFolder, persistenceFile.id);
        // Delete folder and all children's entries in persistenceFileArray
        yield put(actions.deletePersistenceFolderAndChildren(persistenceFile));
        yield call(store.dispatch, actions.updateRefreshFileViewKey());
        yield call(
          showSuccessMessage,
          `Folder ${persistenceFile.name} successfully deleted from Google Drive.`,
          1000
        );
        // Check if user deleted the top level folder that he is syncing
        // If so then delete playground PersistenceFile
        const updatedPersistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        if (updatedPersistenceFileArray.length === 0) {
          yield put(actions.playgroundUpdatePersistenceFile(undefined));
        }
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while deleting folder.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_RENAME_FILE,
    function* ({
      payload: { oldFilePath, newFilePath }
    }: ReturnType<typeof actions.persistenceRenameFile>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());

        // Look for entry of file in persistenceFileArray
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const persistenceFile = persistenceFileArray.find(e => e.path === oldFilePath);
        if (!persistenceFile) {
          // Cannot find pers file
          return;
        }

        yield call(ensureInitialisedAndAuthorised);

        const regexResult = filePathRegex.exec(newFilePath)!;
        const newFileName = regexResult[2] + regexResult[3];

        const regexResult2 = filePathRegex.exec(oldFilePath)!;
        const oldFileName = regexResult2[2] + regexResult2[3];

        // Rename file remotely
        yield call(renameFileOrFolder, persistenceFile.id, newFileName);

        // Rename file's entry in persistenceFileArray
        yield put(
          actions.updatePersistenceFilePathAndNameByPath(oldFilePath, newFilePath, newFileName)
        );
        const [currFileObject] = yield select((state: OverallState) => [
          state.playground.persistenceFile
        ]);
        if (currFileObject.name === oldFileName) {
          // Update playground PersistenceFile if user is syncing a single file
          yield put(
            actions.playgroundUpdatePersistenceFile({ ...currFileObject, name: newFileName })
          );
        }

        yield call(store.dispatch, actions.updateRefreshFileViewKey());
        yield call(
          showSuccessMessage,
          `${newFileName} successfully renamed in Google Drive.`,
          1000
        );
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while renaming file.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
    }
  );

  yield takeEvery(
    PERSISTENCE_RENAME_FOLDER,
    function* ({
      payload: { oldFolderPath, newFolderPath }
    }: ReturnType<typeof actions.persistenceRenameFolder>) {
      const bailNow: boolean = yield call(isGithubSyncing);
      if (bailNow) return; // TODO remove after changing GDrive/Github to be able to work concurrently
      try {
        yield call(store.dispatch, actions.disableFileSystemContextMenus());

        // Look for folder's entry in persistenceFileArray
        const persistenceFileArray: PersistenceFile[] = yield select(
          (state: OverallState) => state.fileSystem.persistenceFileArray
        );
        const persistenceFile = persistenceFileArray.find(e => e.path === oldFolderPath);
        if (!persistenceFile) {
          // Cannot find pers file
          return;
        }

        yield call(ensureInitialisedAndAuthorised);

        const regexResult = filePathRegex.exec(newFolderPath)!;
        const newFolderName = regexResult[2] + regexResult[3];

        const regexResult2 = filePathRegex.exec(oldFolderPath)!;
        const oldFolderName = regexResult2[2] + regexResult2[3];

        // Rename folder remotely
        yield call(renameFileOrFolder, persistenceFile.id, newFolderName);

        // Rename folder and all folder's children in persistenceFileArray
        yield put(
          actions.updatePersistenceFolderPathAndNameByPath(
            oldFolderPath,
            newFolderPath,
            oldFolderName,
            newFolderName
          )
        );
        yield call(store.dispatch, actions.updateRefreshFileViewKey());
        yield call(
          showSuccessMessage,
          `Folder ${newFolderName} successfully renamed in Google Drive.`,
          1000
        );

        const [currFolderObject] = yield select((state: OverallState) => [
          state.playground.persistenceFile
        ]);
        if (currFolderObject.name === oldFolderName) {
          // Update playground PersistenceFile with new name if top level folder was renamed
          yield put(
            actions.playgroundUpdatePersistenceFile({
              ...currFolderObject,
              name: newFolderName,
              isFolder: true
            })
          );
        }
      } catch (ex) {
        console.error(ex);
        yield call(showWarningMessage, `Error while renaming folder.`, 1000);
      } finally {
        yield call(store.dispatch, actions.enableFileSystemContextMenus());
      }
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

  // initialize GIS client
  await new Promise<google.accounts.oauth2.TokenClient>((resolve, reject) => {
    resolve(
      window.google.accounts.oauth2.initTokenClient({
        client_id: Constants.googleClientId!,
        scope: SCOPES,
        callback: () => void 0 // will be updated in getToken()
      })
    );
  }).then(c => {
    tokenClient = c;
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

function* getToken() {
  yield new Promise((resolve, reject) => {
    try {
      // Settle this promise in the response callback for requestAccessToken()
      (tokenClient as any).callback = (resp: google.accounts.oauth2.TokenResponse) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        // GIS has already automatically updated gapi.client
        // with the newly issued access token by this point
        resolve(resp);
      };
      tokenClient.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
  yield call(handleUserChanged, gapi.client.getToken().access_token);
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
    yield call(getToken);
  } else {
    // check if loaded token is still valid
    const email: string | undefined = yield call(getUserProfileDataEmail);
    const isValid = email ? true : false;
    if (!isValid) {
      yield call(getToken);
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

/**
 * Recursively get all files and folders with a given top level folder.
 * @param folderId GDrive API id of the top level folder.
 * @param currFolderName Name of the top level folder.
 * @param currPath Path of the top level folder.
 * @returns Array of objects with name, id, path, isFolder string fields, which represent
 * files/empty folders in the folder.
 */
async function getFilesOfFolder( // recursively get files
  folderId: string,
  currFolderName: string,
  currPath: string = '' // pass in name of folder picked
) {
  let fileList: gapi.client.drive.File[] | undefined;
  await gapi.client.drive.files
    .list({
      q: `'${folderId}' in parents and trashed = false`
    })
    .then(res => {
      fileList = res.result.files;
    });

  if (!fileList || fileList.length === 0) {
    return [
      {
        name: currFolderName,
        id: folderId,
        path: currPath + '/' + currFolderName,
        isFolder: true
      }
    ];
  }

  let ans: any[] = []; // TODO add types?
  for (const currFile of fileList) {
    if (currFile.mimeType === MIME_FOLDER) {
      // currFile is folder
      ans = ans.concat(
        await getFilesOfFolder(currFile.id!, currFile.name!, currPath + '/' + currFolderName)
      );
      ans.push({
        name: currFile.name,
        id: currFile.id,
        parentId: folderId,
        path: currPath + '/' + currFolderName + '/' + currFile.name,
        isFolder: true
      });
    } else {
      // currFile is file
      ans.push({
        name: currFile.name,
        id: currFile.id,
        parentId: folderId,
        path: currPath + '/' + currFolderName + '/' + currFile.name
      });
    }
  }

  return ans;
}

/**
 * Calls GDrive API to get id of an item, given id of the item's parent folder and item name.
 * @param parentFolderId GDrive API id of the folder containing the item to be checked.
 * @param fileName Name of the item to be checked.
 * @returns id of the item.
 */
async function getIdOfFileOrFolder(parentFolderId: string, fileName: string): Promise<string> {
  // Returns string id or empty string if failed
  let fileList: gapi.client.drive.File[] | undefined;

  await gapi.client.drive.files
    .list({
      q: `'${parentFolderId}' in parents and trashed = false and name = '${fileName}'`
    })
    .then(res => {
      fileList = res.result.files;
    });

  if (!fileList || fileList.length === 0) {
    // File does not exist
    return '';
  }

  // Check if file is correct
  if (fileList![0].name === fileName) {
    // File is correct
    return fileList![0].id!;
  } else {
    return '';
  }
}

/**
 * Calls API to delete file/folder from GDrive
 * @param id id of the file/folder
 */
function deleteFileOrFolder(id: string): Promise<any> {
  return gapi.client.drive.files.delete({
    fileId: id
  });
}

/**
 * Calls API to rename file/folder in GDrive
 * @param id id of the file/folder
 * @param newName New name of the file/folder
 */
function renameFileOrFolder(id: string, newName: string): Promise<any> {
  return gapi.client.drive.files.update({
    fileId: id,
    resource: { name: newName }
  });
}

/**
 * Returns the id of the last entry in parentFolders by repeatedly calling GDrive API.
 * Creates folders if needed.
 * @param parentFolders Ordered array of strings of folder names. Top level folder is index 0.
 * @param topFolderId id of the top level folder.
 * @param currDepth Used when recursing.
 * @returns Object with id and parentId string fields, representing id of folder and
 * id of immediate parent of folder respectively.
 */
async function getContainingFolderIdRecursively(
  parentFolders: string[],
  topFolderId: string,
  currDepth: integer = 0
): Promise<{ id: string; parentId: string }> {
  if (parentFolders[0] === '' || currDepth === parentFolders.length) {
    return { id: topFolderId, parentId: '' };
  }
  const currFolderName = parentFolders[parentFolders.length - 1 - currDepth];

  const immediateParentFolderId = await getContainingFolderIdRecursively(
    parentFolders,
    topFolderId,
    currDepth + 1
  ).then(r => r.id);

  let folderList: gapi.client.drive.File[] | undefined;

  await gapi.client.drive.files
    .list({
      q:
        `'${immediateParentFolderId}' in parents and trashed = false and mimeType = '` +
        "application/vnd.google-apps.folder'"
    })
    .then(res => {
      folderList = res.result.files;
    });

  if (!folderList) {
    // Create folder currFolderName
    const newId = await createFolderAndReturnId(immediateParentFolderId, currFolderName);
    return { id: newId, parentId: immediateParentFolderId };
  }

  for (const currFolder of folderList) {
    if (currFolder.name === currFolderName) {
      // Found currFolder.name and id is currFolder.id
      return { id: currFolder.id!, parentId: immediateParentFolderId };
    }
  }

  // Create folder currFolderName
  const newId = await createFolderAndReturnId(immediateParentFolderId, currFolderName);
  return { id: newId, parentId: immediateParentFolderId };
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
    .then(({ result }) => ({ id: result.id, parentId: parent, name: result.name }));
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

function createFolderAndReturnId(parentFolderId: string, folderName: string): Promise<string> {
  const name = folderName;
  const mimeType = MIME_FOLDER;
  const meta = {
    name,
    mimeType,
    parents: [parentFolderId] //[id of the parent folder as a string]
  };

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
    })
    .then(res => res.result.id);
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
