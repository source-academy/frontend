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

export function getPlaygroundSessionUrl(sessionId: string): string {
  let url = window.location.href;
  if (window.location.href.endsWith('/playground')) {
    url += `/${sessionId}`;
  }
  return url;
}

export async function getDocInfoFromSessionId(
  sessionId: string
): Promise<{ docId: string; defaultReadOnly: boolean } | null> {
  const resp = await fetch(getSessionUrl(sessionId));

  if (resp && resp.ok) {
    return resp.json();
  } else {
    return null;
  }
}

export async function createNewSession(
  contents: string
): Promise<{ docId: string; sessionId: string }> {
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

export async function changeDefaultEditable(sessionId: string, defaultReadOnly: boolean) {
  const resp = await fetch(getSessionUrl(sessionId), {
    method: 'PATCH',
    body: JSON.stringify({ defaultReadOnly }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (!resp || !resp.ok) {
    throw new Error(
      resp ? `Could not update session: ${await resp.text()}` : 'Unknown error updating session'
    );
  }

  return resp.json();
}
