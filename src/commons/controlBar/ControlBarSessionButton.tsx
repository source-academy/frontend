import { Classes, Colors, Menu } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { checkSessionIdExists, createNewSession } from '../collabEditing/CollabEditingHelper';
import ControlButton from '../ControlButton';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarSessionButtonsProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetEditorSessionId?: (editorSessionId: string) => void;
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
};

function handleError(error: any) {
  showWarningMessage(`Could not connect: ${(error && error.message) || error || 'Unknown error'}`);
}

export class ControlBarSessionButtons extends React.PureComponent<
  ControlBarSessionButtonsProps,
  State
> {
  private inviteInputElem: React.RefObject<HTMLInputElement>;

  constructor(props: ControlBarSessionButtonsProps) {
    super(props);
    this.state = { joinElemValue: '' };

    this.handleChange = this.handleChange.bind(this);
    this.inviteInputElem = React.createRef();
    this.selectInviteInputText = this.selectInviteInputText.bind(this);
  }

  public render() {
    const handleStartInvite = () => {
      // FIXME this handler should be a Saga action or at least in a controller
      if (this.props.editorSessionId === '') {
        createNewSession(this.props.getEditorValue()).then(sessionId => {
          this.props.handleSetEditorSessionId!(sessionId);
        }, handleError);
      }
    };

    const inviteButtonPopoverContent = (
      <>
        <input value={this.props.editorSessionId} readOnly={true} ref={this.inviteInputElem} />
        <CopyToClipboard text={'' + this.props.editorSessionId}>
          <ControlButton icon={IconNames.DUPLICATE} onClick={this.selectInviteInputText} />
        </CopyToClipboard>
      </>
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
      checkSessionIdExists(this.state.joinElemValue).then(
        exists => {
          if (exists) {
            this.props.handleSetEditorSessionId!(this.state!.joinElemValue);
          } else {
            this.props.handleSetEditorSessionId!('');
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

  private selectInviteInputText() {
    if (this.inviteInputElem.current !== null) {
      this.inviteInputElem.current.focus();
      this.inviteInputElem.current.select();
    }
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ joinElemValue: event.target.value });
  }
}
