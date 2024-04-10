import { Button, ButtonGroup, Icon } from '@blueprintjs/core';
import { IconNames, InfoSign } from '@blueprintjs/icons';
import { useCallback, useState } from 'react';
import ControlButton from 'src/commons/ControlButton';
import classes from 'src/styles/ConfigureControls.module.scss';

type Props = {
  handleAssignEntriesForVoting: (id: number) => void;
  assessmentId: number;
  isVotingPublished: boolean;
};

const AssignEntriesButton: React.FC<Props> = ({
  handleAssignEntriesForVoting,
  assessmentId,
  isVotingPublished
}) => {
  const [confirmAssignEntries, setConfirmAssignEntries] = useState(false);

  // OnClick and Handler functions for confirmation warnings when assigning entries for voting
  const onAssignClick = useCallback(() => setConfirmAssignEntries(true), []);
  const handleConfirmAssign = useCallback(() => {
    handleAssignEntriesForVoting(assessmentId);
  }, [assessmentId, handleAssignEntriesForVoting]);
  const handleCancelAssign = useCallback(() => setConfirmAssignEntries(false), []);

  return (
    <>
      <div className={classes['current-voting-status']}>
        <InfoSign />
        <p className={classes['voting-status-text']}>
          Current Voting Status: Entries have {!isVotingPublished && <b>not </b>} been assigned
        </p>
      </div>
      {!confirmAssignEntries ? (
        <div className={'control-button-container'}>
          <ControlButton
            icon={IconNames.RESET}
            onClick={onAssignClick}
            label={`${!isVotingPublished ? 'Assign' : 'Reassign'} entries for voting`}
          />
        </div>
      ) : (
        <div className={classes['confirm-assign-voting']}>
          <Icon icon="reset" />
          <p className={classes['confirm-assign-text']}>
            Are you sure you want to <b>{isVotingPublished ? 're-assign' : 'assign'} entries?</b>
          </p>
          <ButtonGroup>
            <Button small intent="success" onClick={handleConfirmAssign}>
              Assign
            </Button>
            <Button small intent="danger" onClick={handleCancelAssign}>
              Cancel
            </Button>
          </ButtonGroup>
        </div>
      )}
      {isVotingPublished && (
        <p className={classes['reassign-voting-warning']}>
          <b>All existing votes</b> will be <b>deleted</b> upon reassigning entries!
        </p>
      )}
    </>
  );
};

export default AssignEntriesButton;
