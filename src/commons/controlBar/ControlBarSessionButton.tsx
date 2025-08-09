import { Classes, Colors, Divider, FormGroup, Popover, Text, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { useParams } from 'react-router';

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
  const [isOwner, setIsOwner] = useState(false);

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
        setIsOwner(true);
      }, handleError);
    }
  };

  const handleStartJoining = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
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
            setIsOwner(false);
          } else {
            props.handleSetEditorSessionId!('');
            props.handleSetSessionDetails!(null);
            showWarningMessage('Could not find a session with that ID.');
            if (
              window.location.href.includes('/playground') &&
              !window.location.href.endsWith('/playground')
            ) {
              window.history.pushState({}, document.title, '/playground');
            }
          }
        },
        error => {
          props.handleSetEditorSessionId!('');
          handleError(error);
        }
      );
    },
    [props.handleSetEditorSessionId, props.handleSetSessionDetails]
  );

  const leaveButton = (
    <ControlButton
      label="Leave"
      icon={IconNames.LOG_OUT}
      onClick={() => {
        // FIXME: this handler should be a Saga action or at least in a controller
        props.handleSetEditorSessionId!('');
        joinElemRef.current = '';
        setSessionId('');
      }}
    />
  );

  const inviteButtonPopoverContent = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!props.editorSessionId ? (
        <div
          style={{
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Text>You are not currently in any session.</Text>
          <Divider />
          <ControlButton
            label={'Create a new session'}
            icon={IconNames.ADD}
            onClick={handleStartInvite}
          />
          <br />
          <span>... or join an existing one</span>
          <br />
          <form
            onSubmit={handleStartJoining}
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
          >
            <input type="text" onChange={handleChange} placeholder="Type your code here..." />
            <span className={Classes.POPOVER_DISMISS}>
              <ControlButton icon={IconNames.LOG_IN} options={{ type: 'submit' }} />
            </span>
          </form>
        </div>
      ) : (
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column' }}>
          <Text>
            You have joined the session as{' '}
            {isOwner ? 'the owner' : defaultReadOnly ? 'a viewer' : 'an editor'}.
          </Text>
          <Divider />
          {sessionId && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center'
              }}
            >
              <FormGroup subLabel="Invite other users to this session">
                <input value={sessionId} readOnly={true} />
              </FormGroup>
              <CopyToClipboard
                text={sessionId}
                onCopy={() => showSuccessMessage('Copied to clipboard: ' + sessionId)}
              >
                <ControlButton icon={IconNames.DUPLICATE} />
              </CopyToClipboard>
            </div>
          )}
          {leaveButton}
        </div>
      )}
    </div>
  );

  const tooltipContent = props.isFolderModeEnabled
    ? 'Currently unsupported in Folder mode'
    : undefined;

  const { playgroundCode } = useParams<{ playgroundCode: string }>();
  useEffect(() => {
    if (playgroundCode) {
      joinElemRef.current = playgroundCode;
      handleStartJoining({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
    }
  }, [playgroundCode, handleStartJoining]);

  return (
    <Tooltip content={tooltipContent} disabled={tooltipContent === undefined}>
      <Popover content={inviteButtonPopoverContent} disabled={props.isFolderModeEnabled}>
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
