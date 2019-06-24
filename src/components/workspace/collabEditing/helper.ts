import { LINKS } from '../../../utils/constants';

export function checkSessionIdExists(
  sessionId: string,
  onSessionIdExists: () => void,
  onSessionIdNotExist: () => void,
  onServerUnreachable: () => void
) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      // Successfully reached server to verify ID
      const state = JSON.parse(xmlhttp.responseText).state;
      if (state === true) {
        // Session ID exists
        onSessionIdExists();
      } else {
        onSessionIdNotExist();
      }
    } else if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
      // Cannot reach server
      onServerUnreachable();
    }
  };

  xmlhttp.open('GET', 'https://' + LINKS.SHAREDB_SERVER + 'gists/' + sessionId, true);
  xmlhttp.send();
}

export function createNewSession(onSessionCreated: (sessionId: string) => void) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      const id = JSON.parse(xmlhttp.responseText).id;
      onSessionCreated(id);
    }
  };
  xmlhttp.open('GET', 'https://' + LINKS.SHAREDB_SERVER + 'gists/latest/', true);
  xmlhttp.send();
}
