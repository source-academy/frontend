import {
  Classes,
  Colors,
  Divider,
  FormGroup,
  Menu,
  Popover,
  Text,
  Tooltip
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
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
          this.props.handleSetEditorSessionId!(resp.sessionEditingId);
          this.props.handleSetSessionDetails!({ docId: resp.docId, readOnly: false });
        }, handleError);
      }
    };

    const inviteButtonPopoverContent = (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!this.props.editorSessionId ? (
          <>
            <Text>You are not currently in any session.</Text>
            <Divider />
            <ControlButton label={'Create'} icon={IconNames.ADD} onClick={handleStartInvite} />
          </>
        ) : (
          <>
            <Text>
              You have joined the session as{' '}
              {this.state.sessionEditingId ? 'an editor' : 'a viewer'}.
            </Text>
            <Divider />
            {this.state.sessionEditingId && (
              <FormGroup subLabel="Invite as editor">
                <input
                  value={this.state.sessionEditingId}
                  readOnly={true}
                  ref={this.sessionEditingIdInputElem}
                />
                <CopyToClipboard text={'' + this.state.sessionEditingId}>
                  <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectSessionEditingId} />
                </CopyToClipboard>
              </FormGroup>
            )}
            {this.state.sessionViewingId && (
              <FormGroup subLabel="Invite as viewer">
                <input
                  value={this.state.sessionViewingId}
                  readOnly={true}
                  ref={this.sessionViewingIdInputElem}
                />
                <CopyToClipboard text={'' + this.state.sessionViewingId}>
                  <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectSessionViewingId} />
                </CopyToClipboard>
              </FormGroup>
            )}
          </>
        )}
      </div>
    );

    const inviteButton = (
      <Popover
        popoverClassName="Popover-share"
        inheritDarkTheme={false}
        content={inviteButtonPopoverContent}
      >
        <ControlButton label="Invite" icon={IconNames.GRAPH} />
      </Popover>
    );

    const handleStartJoining = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // FIXME this handler should be a Saga action or at least in a controller
      getDocInfoFromSessionId(this.state.joinElemValue).then(
        docInfo => {
          if (docInfo !== null) {
            this.props.handleSetEditorSessionId!(this.state!.joinElemValue);
            this.props.handleSetSessionDetails!(docInfo);
            if (docInfo.readOnly) {
              this.setState({
                sessionEditingId: '',
                sessionViewingId: this.state.joinElemValue
              });
            } else {
              this.setState({
                sessionEditingId: this.state.joinElemValue,
                sessionViewingId: ''
              });
            }
          } else {
            this.props.handleSetEditorSessionId!('');
            this.props.handleSetSessionDetails!(null);
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
      <Popover
        popoverClassName="Popover-share"
        inheritDarkTheme={false}
        content={joinButtonPopoverContent}
      >
        <ControlButton label="Join" icon={IconNames.LOG_IN} />
      </Popover>
    );

    const leaveButton = (
      <ControlButton
        label="Leave"
        icon={IconNames.FEED}
        onClick={() => {
          // FIXME: this handler should be a Saga action or at least in a controller
          this.props.handleSetEditorSessionId!('');
          this.setState({ joinElemValue: '', sessionEditingId: '', sessionViewingId: '' });
        }}
      />
    );

    const tooltipContent = this.props.isFolderModeEnabled
      ? 'Currently unsupported in Folder mode'
      : undefined;

    return (
      <Tooltip content={tooltipContent} disabled={tooltipContent === undefined}>
        <Popover
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
        </Popover>
      </Tooltip>
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
  }
}
