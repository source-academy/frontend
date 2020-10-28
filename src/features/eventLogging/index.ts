import { v4 as uuid } from 'uuid';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Input as RecorderInput } from '../sourceRecorder/SourceRecorderTypes';

export const playgroundQuestionId: number = -1;

type PlaybackInitial = {
  chapter: number;
  externalLibrary: ExternalLibraryName;
  editorValue: string;
};

type PlaybackInitialTagged = PlaybackInitial & {
  type: 'init';
  time: number;
};

type Input = RecorderInput | PlaybackInitialTagged;

const questionIdLookup: { [id: string]: string } = {};

// ------------------- EXTERNAL API -------------------

const cadetLoggerUrl = process.env.REACT_APP_CADET_LOGGER;
export function log(id: string, input: Input) {
  if (!cadetLoggerUrl) {
    return;
  } // This is set statically
  save_record({
    ...input,
    questionId: questionIdLookup[id],
    sessionId: id
  });
}

// Creates a session, then logs it.
export function initSession(questionId: string, initialState: PlaybackInitial): string {
  const id = uuid();
  questionIdLookup[id] = questionId;
  log(id, {
    ...initialState,
    type: 'init',
    time: Date.now()
  });
  return id;
}

// ------------------- INDEXEDDB API -------------------
type LogRecord = Input & {
  sessionId: string;
  questionId: string;
  time: number;
};

// Yes, past tense. For when it is inside the log.
export type LoggedRecord = LogRecord & { id: number };

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
// This forces it to be singleton,
// preventing multiple uploads without a lock.

export function get_records(): Promise<LoggedRecord[]> {
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

export function delete_records_upto(id: number) {
  return new Promise((resolve, reject) => {
    getDb().then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const range = IDBKeyRange.bound(0, id, false, false);
      const objectStore = transaction.objectStore(STORE_NAME);
      objectStore.delete(range);
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
    });
  });
}

// Importing lodash for this is apparently a bad idea.
// This saves 70kb. Out of 72kb.
function memoize<T>(fn: () => T) {
  let answer: T | null = null;
  return () => {
    if (!answer) {
      answer = fn();
      return answer;
    } else {
      return answer;
    }
  };
}
