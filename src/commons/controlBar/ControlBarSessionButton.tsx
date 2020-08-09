import { Classes, Colors, Menu, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { checkSessionIdExists, createNewSession } from '../collabEditing/CollabEditingHelper';
import controlButton from '../ControlButton';
import { showWarningMessage } from '../utils/NotificationsHelper';

type ControlBarSessionButtonsProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetEditorSessionId?: (editorSessionId: string) => void;
};

type StateProps = {
  editorSessionId?: string;
  editorValue?: string | null;
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
        createNewSession(this.props.editorValue || '').then(sessionId => {
          this.props.handleSetEditorSessionId!(sessionId);
        }, handleError);
      }
    };

    const inviteButton = (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Invite', IconNames.GRAPH, handleStartInvite)}
        <>
          <input value={this.props.editorSessionId} readOnly={true} ref={this.inviteInputElem} />
          <CopyToClipboard text={'' + this.props.editorSessionId}>
            {controlButton('', IconNames.DUPLICATE, this.selectInviteInputText)}
          </CopyToClipboard>
        </>
      </Popover>
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

    const joinButton = (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Join', IconNames.LOG_IN)}
        {/* FIXME this form should use Blueprint */}
        <>
          <form onSubmit={handleStartJoining}>
            <input type="text" value={this.state.joinElemValue} onChange={this.handleChange} />
            <span className={Classes.POPOVER_DISMISS}>
              {controlButton('', IconNames.KEY_ENTER, null, { type: 'submit' })}
            </span>
          </form>
        </>
      </Popover>
    );

    const leaveButton = controlButton('Leave', IconNames.FEED, () => {
      // FIXME this handler should be a Saga action or at least in a controller
      this.props.handleSetEditorSessionId!('');
      this.setState({ joinElemValue: '' });
    });

    return (
      <Popover
        content={
          <Menu large={true}>
            {inviteButton}
            {this.props.editorSessionId === '' ? joinButton : leaveButton}
          </Menu>
        }
      >
        {controlButton('Session', IconNames.SOCIAL_MEDIA, undefined, {
          iconColor:
            this.props.editorSessionId === ''
              ? undefined
              : this.props.sharedbConnected
              ? Colors.GREEN3
              : Colors.RED3
        })}
      </Popover>
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
