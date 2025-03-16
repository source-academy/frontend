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
import React, { useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import { createNewSession, getDocInfoFromSessionId } from '../collabEditing/CollabEditingHelper';
import ControlButton from '../ControlButton';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';

type ControlBarSessionButtonsProps = DispatchProps & StateProps;

type DispatchProps = {
  handleSetEditorSessionId?: (editorSessionId: string) => void;
  handleSetSessionDetails?: (
    sessionDetails: { docId: string; readOnly: boolean; owner: boolean } | null
  ) => void;
};

type StateProps = {
  isFolderModeEnabled: boolean;
  editorSessionId?: string;
  getEditorValue: () => string;
  sharedbConnected?: boolean;
  key: string;
};

function handleError(error: any) {
  showWarningMessage(`Could not connect: ${(error && error.message) || error || 'Unknown error'}`);
}

export function ControlBarSessionButtons(props: ControlBarSessionButtonsProps) {
  const joinElemRef = useRef('');
  const [sessionId, setSessionId] = useState('');
  const [defaultReadOnly, setDefaultReadOnly] = useState(true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    joinElemRef.current = event.target.value;
  };

  const handleStartInvite = () => {
    // FIXME this handler should be a Saga action or at least in a controller
    if (props.editorSessionId === '') {
      createNewSession(props.getEditorValue()).then(resp => {
        setSessionId(resp.sessionId);
        props.handleSetEditorSessionId!(resp.sessionId);
        props.handleSetSessionDetails!({ docId: resp.docId, readOnly: false, owner: true });
      }, handleError);
    }
  };

  const inviteButtonPopoverContent = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!props.editorSessionId ? (
        <>
          <Text>You are not currently in any session.</Text>
          <Divider />
          <ControlButton label={'Create'} icon={IconNames.ADD} onClick={handleStartInvite} />
        </>
      ) : (
        <>
          <Text>You have joined the session as {defaultReadOnly ? 'a viewer' : 'an editor'}.</Text>
          <Divider />
          {sessionId && (
            <FormGroup subLabel="Invite">
              <input value={sessionId} readOnly={true} />
              <CopyToClipboard
                text={sessionId}
                onCopy={() => showSuccessMessage('Copied to clipboard')}
              >
                <ControlButton icon={IconNames.DUPLICATE} />
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
      <ControlButton label={props.editorSessionId ? 'Invite' : 'Create'} icon={IconNames.GRAPH} />
    </Popover>
  );

  const handleStartJoining = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const joinElemValue = joinElemRef.current;

    // FIXME this handler should be a Saga action or at least in a controller
    getDocInfoFromSessionId(joinElemValue).then(
      docInfo => {
        if (docInfo !== null) {
          props.handleSetEditorSessionId!(joinElemValue);
          props.handleSetSessionDetails!({
            docId: docInfo.docId,
            readOnly: docInfo.defaultReadOnly,
            owner: false
          });
          setSessionId(joinElemValue);
          setDefaultReadOnly(docInfo.defaultReadOnly);
        } else {
          props.handleSetEditorSessionId!('');
          props.handleSetSessionDetails!(null);
          showWarningMessage('Could not find a session with that ID.');
        }
      },
      error => {
        props.handleSetEditorSessionId!('');
        handleError(error);
      }
    );
  };

  const joinButtonPopoverContent = (
    // TODO: this form should use Blueprint
    <form onSubmit={handleStartJoining}>
      <input type="text" onChange={handleChange} />
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
        props.handleSetEditorSessionId!('');
        joinElemRef.current = '';
        setSessionId('');
      }}
    />
  );

  const tooltipContent = props.isFolderModeEnabled
    ? 'Currently unsupported in Folder mode'
    : undefined;

  return (
    <Tooltip content={tooltipContent} disabled={tooltipContent === undefined}>
      <Popover
        content={
          <Menu large={true}>
            {inviteButton}
            {props.editorSessionId === '' ? joinButton : leaveButton}
          </Menu>
        }
        disabled={props.isFolderModeEnabled}
      >
        <ControlButton
          label="Session"
          icon={IconNames.SOCIAL_MEDIA}
          options={{
            iconColor:
              props.editorSessionId === ''
                ? undefined
                : props.sharedbConnected
                  ? Colors.GREEN3
                  : Colors.RED3
          }}
          isDisabled={props.isFolderModeEnabled}
        />
      </Popover>
    </Tooltip>
  );
}
