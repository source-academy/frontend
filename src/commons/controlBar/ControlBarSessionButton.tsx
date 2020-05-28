import { Classes, Colors, Menu, Popover } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import {
  checkSessionIdExists,
  createNewSession
} from '../collabEditing/CollabEditingHelper';
import controlButton from '../ControlButton';

type ControlBarSessionButtonsProps = DispatchProps & StateProps;

type DispatchProps = {
  handleInitInvite?: (value: string) => void;
  handleInvalidEditorSessionId?: () => void;
  handleSetEditorSessionId?: (editorSessionId: string) => void;
};

type StateProps = {
  editorSessionId?: string;
  editorValue?: string | null;
  websocketStatus?: number;
  key: string;
};

type State = {
  joinElemValue: string;
};

export class ControlBarSessionButtons extends React.PureComponent<ControlBarSessionButtonsProps, State> {
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
      if (this.props.editorSessionId === '') {
        const onSessionCreated = (sessionId: string) => {
          this.props.handleSetEditorSessionId!(sessionId);
          const code = this.props.editorValue || '// Collaborative Editing Mode!';
          this.props.handleInitInvite!(code);
        };
        createNewSession(onSessionCreated);
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
      const onSessionIdExists = () =>
        this.props.handleSetEditorSessionId!(this.state!.joinElemValue);

      const onSessionIdNotExist = () => {
        this.props.handleInvalidEditorSessionId!();
        this.props.handleSetEditorSessionId!('');
      };

      const onServerUnreachable = () => this.props.handleSetEditorSessionId!('');

      checkSessionIdExists(
        this.state.joinElemValue,
        onSessionIdExists,
        onSessionIdNotExist,
        onServerUnreachable
      );
      event.preventDefault();
    };

    const joinButton = (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Join', IconNames.LOG_IN)}
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
              : this.props.websocketStatus === 0
              ? Colors.RED3
              : Colors.GREEN3
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
