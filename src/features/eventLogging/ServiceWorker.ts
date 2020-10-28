import { delete_records_upto, get_records, LoggedRecord } from '.';

const cadetLoggerUrl = process.env.REACT_APP_CADET_LOGGER;
// Hardcode, otherwise they will include the entire .env file into the serviceWorker.
const SEND_INTERVAL = 10000;
// This needs to be a library, so i'm simply going to export a main function
// TODO: actually upload something.
export function main() {
  if (!cadetLoggerUrl) {
    return;
  } // This is set statically.
  let accessToken: string | null = null;

  // eslint-disable-next-line no-restricted-globals
  self.addEventListener('message', evt => {
    if (evt.data.type === 'ACCESS_TOKEN') {
      accessToken = evt.data.accessToken;
    }
  });

  // While active, periodically grab stuff off the database
  setInterval(async () => {
    try {
      if (!accessToken) {
        // upload later.
        return;
      }
      const records = await get_records();
      const last = records.length;
      if (last === 0) {
        return;
      }

      await uploadLogs(cadetLoggerUrl!, accessToken, records);
      // This can throw, so the next part will only run if there are no errors.

      const lastId = records[last - 1].id;
      // Delete records
      await delete_records_upto(lastId);
    } catch (e) {
      // Do nothing: retry later.
    }
  }, SEND_INTERVAL);
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

const setAccessTokenRetry = retryLatest(5000); // this allows the latest set_access_token to win, regardless of location.
// Can't share cookies across threads.
// At least not yet, it's in proposal: https://developers.google.com/web/updates/2018/09/asynchronous-access-to-http-cookies
// This sends the access token out to the serviceworker.
export async function set_access_token(accessToken: string) {
  if ('serviceWorker' in navigator) {
    setAccessTokenRetry(() => {
      if (!navigator.serviceWorker.controller) {
        throw new Error("Don't stop trying :3");
      }
      navigator.serviceWorker.controller.postMessage({
        type: 'ACCESS_TOKEN',
        accessToken
      });
    });
  }
}

// Keep retrying the latest function until it works.
function retryLatest(interval: number) {
  let fn: (() => void) | null = null;
  const retry = (f: (() => void) | null) => {
    fn = f;
    if (!fn) {
      return;
    }
    try {
      fn();
    } catch (e) {
      setTimeout(() => retry(fn), interval);
    }
  };
  return retry;
}
