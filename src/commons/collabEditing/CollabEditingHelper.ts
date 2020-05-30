import { Links } from '../utils/Constants';
import { XMLHttpReadyState, XMLHttpStatus } from './CollabEditingTypes';

export function checkSessionIdExists(
  editorSessionId: string,
  handleConnectionOK: () => void,
  handleSessionIdNotFound: () => void,
  handleCannotReachServer: () => void
) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState !== XMLHttpReadyState.DONE) {
      return;
    }
    if (xmlhttp.status !== XMLHttpStatus.OK) {
      handleCannotReachServer();
      return;
    }
    const sessionIdExists: boolean = JSON.parse(xmlhttp.responseText).state;
    if (!sessionIdExists) {
      handleSessionIdNotFound();
      return;
    }
    handleConnectionOK();
  };
  xmlhttp.open('GET', 'https://' + Links.shareDBServer + 'gists/' + editorSessionId, true);
  xmlhttp.send();
}

export function createNewSession(onSessionCreated: (sessionId: string) => void) {
  const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState === XMLHttpReadyState.DONE && xmlhttp.status === XMLHttpStatus.OK) {
      const id: string = JSON.parse(xmlhttp.responseText).id;
      onSessionCreated(id);
    }
  };
  xmlhttp.open('GET', 'https://' + Links.shareDBServer + 'gists/latest/', true);
  xmlhttp.send();
}
