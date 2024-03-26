import Constants from '../utils/Constants';

const protocolMap = Object.freeze({
  'http:': 'ws:',
  'https:': 'wss:'
});

export function getSessionUrl(sessionId: string, ws?: boolean): string {
  const url = new URL(sessionId, Constants.sharedbBackendUrl);
  if (ws && Object.keys(protocolMap).includes(url.protocol)) {
    url.protocol = protocolMap[url.protocol as keyof typeof protocolMap];
  }
  return url.toString();
}

export async function getDocInfoFromSessionId(
  sessionId: string
): Promise<{ docId: string; readOnly: boolean } | null> {
  const resp = await fetch(getSessionUrl(sessionId));

  if (resp && resp.ok) {
    return resp.json();
  } else {
    return null;
  }
}

export async function createNewSession(
  contents: string
): Promise<{ docId: string; sessionEditingId: string; sessionViewingId: string }> {
  const resp = await fetch(Constants.sharedbBackendUrl, {
    method: 'POST',
    body: JSON.stringify({ contents }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (!resp || !resp.ok) {
    throw new Error(
      resp ? `Could not create new session: ${await resp.text()}` : 'Unknown error creating session'
    );
  }

  return resp.json();
}
