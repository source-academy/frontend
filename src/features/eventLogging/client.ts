export const SYNC_LOGS = 'SYNC_LOGS';

export function triggerSyncLogs(accessToken?: string) {
  if (!accessToken) {
    return;
  }
  navigator.serviceWorker.controller?.postMessage({ type: SYNC_LOGS, accessToken });
}
