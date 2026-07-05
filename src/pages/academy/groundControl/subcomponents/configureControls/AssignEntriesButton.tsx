import { Button, ButtonGroup, Icon } from '@blueprintjs/core';
import { IconNames, InfoSign } from '@blueprintjs/icons';
import { useCallback, useState } from 'react';
import ControlButton from 'src/commons/ControlButton';

type Props = {
  handleAssignEntriesForVoting: (id: number) => void;
  assessmentId: number;
  isVotingPublished: boolean;
};

function AssignEntriesButton({
  handleAssignEntriesForVoting,
  assessmentId,
  isVotingPublished,
}: Props) {
  const [confirmAssignEntries, setConfirmAssignEntries] = useState(false);

  // OnClick and Handler functions for confirmation warnings when assigning entries for voting
  const onAssignClick = useCallback(() => setConfirmAssignEntries(true), []);
  const handleConfirmAssign = useCallback(() => {
    handleAssignEntriesForVoting(assessmentId);
  }, [assessmentId, handleAssignEntriesForVoting]);
  const handleCancelAssign = useCallback(() => setConfirmAssignEntries(false), []);

  return (
    <>
      <div className="max-h-[30px] flex items-center gap-1.5 ml-4">
        <InfoSign />
        <p className="mt-2.5">
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
        <div className="max-h-[30px] flex items-center gap-1.5 ml-4">
          <Icon icon="reset" />
          <p className="mt-[9px]">
            Are you sure you want to <b>{isVotingPublished ? 're-assign' : 'assign'} entries?</b>
          </p>
          <ButtonGroup>
            <Button size="small" intent="success" onClick={handleConfirmAssign}>
              Assign
            </Button>
            <Button size="small" intent="danger" onClick={handleCancelAssign}>
              Cancel
            </Button>
          </ButtonGroup>
        </div>
      )}
      {isVotingPublished && (
        <p className="text-xs ml-[38px]">
          <b>All existing votes</b> will be <b>deleted</b> upon reassigning entries!
        </p>
      )}
    </>
  );
}

export default AssignEntriesButton;
