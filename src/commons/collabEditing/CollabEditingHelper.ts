import Constants from '../utils/Constants';

const protocolMap = {
  'http:': 'ws:',
  'https:': 'wss:'
};

export function getSessionUrl(sessionId: string, ws?: boolean): string {
  const url = new URL(sessionId, Constants.sharedbBackendUrl);
  if (ws) {
    url.protocol = protocolMap[url.protocol];
  }
  return url.toString();
}

export async function checkSessionIdExists(sessionId: string): Promise<boolean> {
  const resp = await fetch(getSessionUrl(sessionId));

  return resp && resp.ok;
}

export async function createNewSession(initial: string): Promise<string> {
  const resp = await fetch(Constants.sharedbBackendUrl, {
    method: 'POST',
    body: initial,
    headers: { 'Content-Type': 'text/plain' }
  });

  if (!resp || !resp.ok) {
    throw new Error(
      resp ? `Could not create new session: ${await resp.text()}` : 'Unknown error creating session'
    );
  }

  return resp.text();
}
