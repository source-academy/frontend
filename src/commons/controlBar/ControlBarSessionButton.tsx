import { Classes, Colors, Menu, Text } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { createNewSession, getDocInfoFromSessionId } from '../collabEditing/CollabEditingHelper';
import ControlButton from '../ControlButton';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

type ControlBarSessionButtonsProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetEditorSessionId?: (editorSessionId: string) => void;
  handleSetSessionDetails?: (sessionDetails: { docId: string; readOnly: boolean } | null) => void;
};

type StateProps = {
  isFolderModeEnabled: boolean;
  editorSessionId?: string;
  getEditorValue: () => string;
  sharedbConnected?: boolean;
  key: string;
};

type State = {
  joinElemValue: string;
  sessionEditingId: string;
  sessionViewingId: string;
};

function handleError(error: any) {
  showWarningMessage(`Could not connect: ${(error && error.message) || error || 'Unknown error'}`);
}

export class ControlBarSessionButtons extends React.PureComponent<
  ControlBarSessionButtonsProps,
  State
> {
  private sessionEditingIdInputElem: React.RefObject<HTMLInputElement>;
  private sessionViewingIdInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarSessionButtonsProps) {
    super(props);
    this.state = { joinElemValue: '', sessionEditingId: '', sessionViewingId: '' };

    this.handleChange = this.handleChange.bind(this);
    this.sessionEditingIdInputElem = React.createRef();
    this.sessionViewingIdInputElem = React.createRef();
    this.selectSessionEditingId = this.selectSessionEditingId.bind(this);
    this.selectSessionViewingId = this.selectSessionViewingId.bind(this);
  }

  public render() {
    const handleStartInvite = () => {
      // FIXME this handler should be a Saga action or at least in a controller
      if (this.props.editorSessionId === '') {
        createNewSession(this.props.getEditorValue()).then(resp => {
          this.setState({
            sessionEditingId: resp.sessionEditingId,
            sessionViewingId: resp.sessionViewingId
          });
          console.log(this.state);
          this.props.handleSetEditorSessionId!(resp.sessionEditingId);
          this.props.handleSetSessionDetails!({ docId: resp.docId, readOnly: false });
        }, handleError);
      }
    };

    const inviteButtonPopoverContent = (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!this.props.editorSessionId ? (
          <ControlButton label={'Create'} icon={IconNames.ADD} onClick={handleStartInvite} />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text>Invite as editor:</Text>
              <div style={{ marginLeft: '10px' }}>
                <input
                  value={this.state.sessionEditingId}
                  readOnly={true}
                  ref={this.sessionEditingIdInputElem}
                />
                <CopyToClipboard text={'' + this.state.sessionEditingId}>
                  <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectSessionEditingId} />
                </CopyToClipboard>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text>Invite as viewer:</Text>
              <div style={{ marginLeft: '10px' }}>
                <input
                  value={this.state.sessionViewingId}
                  readOnly={true}
                  ref={this.sessionViewingIdInputElem}
                />
                <CopyToClipboard text={'' + this.state.sessionViewingId}>
                  <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectSessionViewingId} />
                </CopyToClipboard>
              </div>
            </div>
          </>
        )}
      </div>
    );

    const inviteButton = (
      <Popover2
        popoverClassName="Popover-share"
        inheritDarkTheme={false}
        content={inviteButtonPopoverContent}
      >
        <ControlButton label="Invite" icon={IconNames.GRAPH} onClick={handleStartInvite} />
      </Popover2>
    );

    const handleStartJoining = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // FIXME this handler should be a Saga action or at least in a controller
      getDocInfoFromSessionId(this.state.joinElemValue).then(
        docInfo => {
          if (docInfo !== null) {
            this.props.handleSetEditorSessionId!(this.state!.joinElemValue);
            this.props.handleSetSessionDetails!(docInfo);
          } else {
            this.props.handleSetEditorSessionId!('');
            this.props.handleSetSessionDetails!({ docId: '', readOnly: false });
            showWarningMessage('Could not find a session with that ID.');
          }
        },
        error => {
          this.props.handleSetEditorSessionId!('');
          handleError(error);
        }
      );
    };

    const joinButtonPopoverContent = (
      // TODO: this form should use Blueprint
      <form onSubmit={handleStartJoining}>
        <input type="text" value={this.state.joinElemValue} onChange={this.handleChange} />
        <span className={Classes.POPOVER_DISMISS}>
          <ControlButton icon={IconNames.KEY_ENTER} options={{ type: 'submit' }} />
        </span>
      </form>
    );

    const joinButton = (
      <Popover2
        popoverClassName="Popover-share"
        inheritDarkTheme={false}
        content={joinButtonPopoverContent}
      >
        <ControlButton label="Join" icon={IconNames.LOG_IN} />
      </Popover2>
    );

    const leaveButton = (
      <ControlButton
        label="Leave"
        icon={IconNames.FEED}
        onClick={() => {
          // FIXME: this handler should be a Saga action or at least in a controller
          this.props.handleSetEditorSessionId!('');
          this.setState({ joinElemValue: '' });
          console.log(this.state);
        }}
      />
    );

    const tooltipContent = this.props.isFolderModeEnabled
      ? 'Currently unsupported in Folder mode'
      : undefined;

    return (
      <Tooltip2 content={tooltipContent} disabled={tooltipContent === undefined}>
        <Popover2
          content={
            <Menu large={true}>
              {inviteButton}
              {this.props.editorSessionId === '' ? joinButton : leaveButton}
            </Menu>
          }
          disabled={this.props.isFolderModeEnabled}
        >
          <ControlButton
            label="Session"
            icon={IconNames.SOCIAL_MEDIA}
            options={{
              iconColor:
                this.props.editorSessionId === ''
                  ? undefined
                  : this.props.sharedbConnected
                  ? Colors.GREEN3
                  : Colors.RED3
            }}
            isDisabled={this.props.isFolderModeEnabled}
          />
        </Popover2>
      </Tooltip2>
    );
  }

  private selectSessionEditingId() {
    if (this.sessionEditingIdInputElem.current !== null) {
      this.sessionEditingIdInputElem.current.focus();
      this.sessionEditingIdInputElem.current.select();
    }
  }

  private selectSessionViewingId() {
    if (this.sessionViewingIdInputElem.current !== null) {
      this.sessionViewingIdInputElem.current.focus();
      this.sessionViewingIdInputElem.current.select();
    }
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ joinElemValue: event.target.value });
    console.log(this.state);
  }
}
