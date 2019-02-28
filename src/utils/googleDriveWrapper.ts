// import * as _ from 'lodash';

const CLIENT_ID = '909364069614-p4gsl8iv6f1gfldn7sl0env15kvjd87p.apps.googleusercontent.com'
const API_KEY = 'AIzaSyCQhSKSkV0e6-LX_JHztLmVBBgPnNtr5q0'

// Array of API discovery doc URLs for APIs used by the quickstart
// const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
const SCOPES = 'https://www.googleapis.com/auth/drive.drive'
const MIME_FOLDER = 'application/vnd.google-apps.folder'
// const MIME_JSON = 'application/json';
const APP_ROOT_FOLDER_NAME = 'Source Academy'

// ---------------- IFile Type ----------------
type FilePath = string[] // A/B/filename = ["A", "B", "filename"]
interface IFile {
  type: 'folder' | 'file'
  path: FilePath
}

// ---------------- GAPI initialization  ----------------

// function createFile(file: IFile, parent: IFileCached | null, mimeType: string,
//                     contents: string = ''): Promise<IFileCached> {
//   const boundary = 'N1UTGHFPQ1M9FB455CRN';
//   const name = getFilename(file);
//   const meta = {
//     name,
//     mimeType,
//     parents: parent ? [parent.id] : [],
//     appProperties: {
//       source: true,
//     },
//   };
//   const body = `
// --${boundary}
// Content-Type: application/json; charset=UTF-8
// ${JSON.stringify(meta)}
// --${boundary}
// Content-Type: ${mimeType}
// ${contents}
// --${boundary}--
// `;
//
//   console.log('@createFile', meta, body);
//   return new Promise( (resolve, reject) => {
//     gapi.client.request<any>({
//       path: 'https://www.googleapis.com/upload/drive/v3/files',
//       method: 'POST',
//       params: {
//         uploadType: 'multipart',
//       },
//       headers: {
//         'Content-Type': `multipart/related; boundary=${boundary}`,
//       },
//       body,
//     }).then( (response) => {
//       if (response.status !== 200) {
//         reject(response);
//       } else {
//         const newfile = response.result;
//         const fcache = parent ? file as IFileCached : cacheRoot;
//         fcache.id = newfile.id;
//         fcache.mimeType = mimeType;
//         if (parent) {
//           parent.children[name] = fcache;
//         }
//         resolve(fcache);
//       }
//     });
//   });
// }

export function initializeAuth(token: string): Promise<any> {
  // tslint:disable-next-line:no-console
  console.log("init drive and auth'")
  return new Promise((resolve, reject) => {
    // tslint:disable-next-line:no-console
    console.log('init drive and auth 111')
    gapi.load('client:auth2', () => {
      // tslint:disable-next-line:no-console
      console.log('init drive and auth 222')
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        // discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      })

      // tslint:disable-next-line:no-console
      console.log('init drive and auth 333')
      gapi.client.setToken({
        access_token: token
      })
      resolve()
    })
  })
    .then(() => {
      // tslint:disable-next-line:no-console
      console.log('psssss')
      return gapi.client.load('drive', 'v3')
    })
    .then(() => createBaseFolder())
}

function getFilename(file: IFile): string {
  if (file.path.length === 0) {
    return APP_ROOT_FOLDER_NAME
  } else {
    const len = file.path.length
    return file.path[len - 1]
  }
}

export function createBaseFolder() {
  // tslint:disable-next-line:no-console
  console.log('creatin bas efolder')
  const baseFolder: IFile = {
    path: ['Source Academy'],
    type: 'folder'
  }
  return createFolder(baseFolder)
}

// Google drive can only create folder, cannot craete file and upload data.
// See: https://gist.github.com/tanaikech/bd53b366aedef70e35a35f449c51eced
export function createFolder(file: IFile): Promise<void> {
  const name = getFilename(file)
  const meta = {
    mimeType: MIME_FOLDER,
    modifiedTime: new Date(),
    name,
    appProperties: {
      source: true
    }
  }
  // tslint:disable-next-line:no-console
  console.log('@@createFolder', file.path)
  return new Promise((resolve, reject) => {
    gapi.client.drive.files
      .create({
        resource: meta
      })
      .then((response: any) => {
        if (response.status !== 200) {
          // tslint:disable-next-line:no-console
          console.log('err ' + response)
          reject(response)
        } else {
          // tslint:disable-next-line:no-console
          console.log('succ ' + response)
          resolve()
        }
      })
  })
}

// // listFiles(null) lists all files.
// // TODO: implement pagination
// function listFiles(folder: IFileCached | null = cacheRoot, options = {}): Promise<gapi.client.drive.FileList> {
//   const qoptions = _.assign({
//     spaces: 'drive',
//     pageSize: 100,
//     fields: 'nextPageToken, files(id, name)',
//   }, options);
//   if (folder !== null) {
//     const opt = (qoptions as any);
//     opt.q =  (opt.q ? opt.q + ' and ' : '') + `'${folder.id}' in parents`;
//   }
//   console.log('@listfile', qoptions, folder);
//   return new Promise( (resolve, reject) => {
//     gapi.client.drive.files
//       .list(qoptions).then( (response) => {
//       if (response.status !== 200) {
//         reject(response);
//       } else {
//         resolve(response.result);
//       }
//     });
//   });
// }
//
// function getFileContents(id: string): Promise<string> {
//   return new Promise( (resolve, reject) => {
//     gapi.client.drive.files.get({
//       fileId: id,
//       alt: 'media',
//     }).then( (response) => {
//       if (response.status !== 200) {
//         reject(response);
//       } else {
//         console.log('@getFileContents', response);
//         resolve(response.body);
//       }
//     });
//   });
// }

// export function saveExercise(pathId: string, questionId: string, state: IExerciseState) {
//   // Ensure the google drive folder exists.
//   const parent: IFile = {
//     type: 'folder',
//     path: ['paths', pathId, questionId],
//   };
//   return ensureInitialized()
//     .then ( () => ensureFolder(parent) )
//     .then((parentFolder) => {
//       return listFiles(parentFolder, {
//         q: `appProperties has { key='pathFinder' and value='true' } and mimeType = '${MIME_JSON}'`,
//         orderBy: 'createdTime desc',
//       }).then( (result) => {
//         console.log('@listFiles', result.files);
//         let nextFile = 0;
//         if (result.files && result.files.length) {
//           const filename = result.files[0].name!;
//           nextFile = parseInt(filename.split('.')[0], 10) + 1;
//         }
//         const file: IFile = {
//           path: pathAppend(parent.path, `${nextFile}.json`),
//           type: 'file',
//         };
//         // Write the state.
//         return createFile(file, parentFolder, MIME_JSON, JSON.stringify(state, null, 2));
//       });
//     });
// }
//
// export function loadLastExercise(pathId, questionId): Promise<IExerciseState> {
//   // Look for the correct google drive folder
//   const parent: IFile = {
//     type: 'folder',
//     path: ['paths', pathId, questionId],
//   };
//   return ensureInitialized()
//     .then ( () => ensureFolder(parent) )
//     .then((parentFolder) => {
//       return listFiles(parentFolder, {
//         q: `appProperties has { key='pathFinder' and value='true' } and mimeType = '${MIME_JSON}'`,
//         orderBy: 'createdTime desc',
//       }).then ( (result) => {
//         if (result.files && result.files.length) {
//           const file = result.files[0];
//           // Grab the file
//           return getFileContents(file.id!)
//             .then ( (contents) => {
//               return JSON.parse(contents);
//             });
//         } else {
//           return {
//             code: '',
//           };
//         }
//       });
//     });
// }
