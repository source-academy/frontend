import { memoize } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Input as RecorderInput, PlaybackData } from '../sourceRecorder/SourceRecorderTypes';
export type UnsentLog = {
  assessmentId: number;
  questionId: number;
  playbackData: PlaybackData;
};

export const playgroundQuestionId: number = -1;

type PlaybackInitial = {
  chapter: number;
  externalLibrary: ExternalLibraryName;
  editorValue: string;
};

type PlaybackInitialTagged = PlaybackInitial & {
  assessmentId: number;
  type: 'init';
  time: number;
};
type Input = RecorderInput | PlaybackInitialTagged;

const assessmentIdLookup: { [id: string]: number } = {};

// ------------------- EXTERNAL API -------------------

export function log(id: string, input: Input) {
  // TODO: disable logging if not logged in.
  console.log(id, input);
  save_record({
    ...input,
    sessionId: id,
    assessmentId: assessmentIdLookup[id]
  }).then(() => {
    get_records().then(x => console.log('records:', x));
  });
}

// Creates a session, then logs it.
export function initSession(assessmentId: number, initialState: PlaybackInitial): string {
  const id = uuid();
  assessmentIdLookup[id] = assessmentId;
  log(id, {
    ...initialState,
    assessmentId,
    type: 'init',
    time: Date.now()
  });
  return id;
}

// ------------------- INDEXEDDB API -------------------
type LogRecord = Input & {
  sessionId: string;
  assessmentId: number;
  time: number;
};

const VERSION = 1;
const DB_NAME = 'evtlogs';
const STORE_NAME = 'logs';
const getDb = memoize(
  (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      // Make a request
      const request = indexedDB.open(DB_NAME, VERSION);
      // hook the onsuccess
      request.onsuccess = evt => {
        resolve(request.result);
      };

      request.onerror = evt => {
        console.error('Failed to get db', evt);
        reject(request.error);
      };

      // Set it up if necessary (on upgrade)
      request.onupgradeneeded = evt => {
        // Create the database here
        const db: IDBDatabase = (evt?.target as any).result; // Bug with the types...
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id', // Entry id, only used to figure out the last transfered value
          autoIncrement: true
        });
      };
    });
  }
);

function save_record(record: LogRecord) {
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = reject;

      const objectStore = transaction.objectStore(STORE_NAME);
      /*const request = */ objectStore.add(record);
      // Can actually check for request success.
    });
  });
}

// Retrieving and uploading records
// TODO: put into a serviceworker.
// This forces it to be singleton,
// preventing multiple uploads without a lock.

export function get_records() {
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      objectStore.getAll().onsuccess = function (evt) {
        const result = (evt?.target as any).result;
        resolve(result);
      };
    });
  });
}
