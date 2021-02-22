/// <reference lib="webworker" />
import { deleteRecordsUpto, getRecords, LoggedRecord } from '.';
import { SYNC_LOGS } from './client';

declare const self: ServiceWorkerGlobalScope;

let currentlyUploading = false;
const cadetLoggerUrl = process.env.REACT_APP_CADET_LOGGER;

// This needs to be a library, so i'm simply going to export a main function
// TODO: actually upload something.
export function main() {
  if (!cadetLoggerUrl) {
    return;
  } // This is set statically.

  self.addEventListener('message', evt => {
    if (evt.data && evt.data.type === SYNC_LOGS) {
      evt.waitUntil(trySyncLogs(evt.data.accessToken));
    }
  });
}

async function trySyncLogs(accessToken: string) {
  if (currentlyUploading) {
    return;
  }
  try {
    currentlyUploading = true;
    const records = await getRecords();
    const last = records.length;
    if (last === 0) {
      return;
    }

    await uploadLogs(cadetLoggerUrl!, accessToken, records);
    // This can throw, so the next part will only run if there are no errors.

    const lastId = records[last - 1].id;
    // Delete records
    await deleteRecordsUpto(lastId);
  } catch (e) {
    // Do nothing: retry later.
  } finally {
    currentlyUploading = false;
  }
}

async function uploadLogs(cadetLoggerUrl: string, accessToken: string, logs: LoggedRecord[]) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Content-Type', 'application/json');

  const fetchOpts = {
    method: 'POST',
    headers,
    body: JSON.stringify(logs)
  };
  const resp = await fetch(cadetLoggerUrl, fetchOpts);
  if (!resp.ok) {
    throw new Error('Just try again later');
  }
}
