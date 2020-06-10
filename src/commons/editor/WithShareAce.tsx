import { EditorBase, Constructor } from './Editor';
import sharedbAce from 'sharedb-ace';
import { checkSessionIdExists } from '../collabEditing/CollabEditingHelper';
import { Links } from '../utils/Constants';

function WithShareAce<C extends Constructor<EditorBase>>(Editor: C) {
  return class extends Editor {
    public ShareAce: any = null;

    public componentDidMount() {
      super.componentDidMount();
      // Has session ID
      if (this.props.editorSessionId !== '') {
        this.handleStartCollabEditing(this.editor);
      }
    }

    public componentWillUnmount() {
      if (this.ShareAce !== null) {
        // Umounting, closing websocket
        this.ShareAce.WS.close();
      }
      this.ShareAce = null;
    }

    protected handleStartCollabEditing = (editor: any) => {
      const ShareAce = new sharedbAce(this.props.editorSessionId!, {
        WsUrl: 'wss://' + Links.shareDBServer + 'ws/',
        pluginWsUrl: null,
        namespace: 'codepad'
      });
      this.ShareAce = ShareAce;
      ShareAce.on('ready', () => {
        ShareAce.add(
          editor,
          ['code'],
          [
            // TODO: Removal
            // SharedbAceRWControl,
            // SharedbAceMultipleCursors
          ]
        );
        if (this.props.sharedbAceIsInviting) {
          this.props.handleEditorValueChange(this.props.sharedbAceInitValue!);
          this.props.handleFinishInvite!();
        }
      });

      // WebSocket connection status detection logic
      const WS = ShareAce.WS;
      let interval: any;
      const sessionIdNotFound = () => {
        clearInterval(interval);
        WS.close();
      };
      const cannotReachServer = () => {
        WS.reconnect();
      };
      const checkStatus = () => {
        if (this.ShareAce === null) {
          return;
        }
        checkSessionIdExists(
          this.props.editorSessionId,
          () => {},
          sessionIdNotFound,
          cannotReachServer
        );
      };
      // Checks connection status every 5sec
      interval = setInterval(checkStatus, 5000);

      WS.addEventListener('open', (event: Event) => {
        this.props.handleSetWebsocketStatus!(1);
      });
      WS.addEventListener('close', (event: Event) => {
        this.props.handleSetWebsocketStatus!(0);
      });
    };
  };
}

export default WithShareAce;
