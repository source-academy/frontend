import {
  Button,
  ButtonGroup,
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Intent,
  NumericInput,
  Switch
} from '@blueprintjs/core';
import { IconNames, InfoSign, Reset, Team } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handleConfigureAssessment: (
    id: number,
    hasVotingFeatures: boolean,
    hasTokenCounter: boolean
  ) => void;
  handleAssignEntriesForVoting: (id: number) => void;
  data: AssessmentOverview;
};

const ConfigureCell: React.FC<Props> = ({
  handleConfigureAssessment,
  handleAssignEntriesForVoting,
  data
}) => {
  const [isDialogOpen, setDialogState] = useState(false);
  const [hasVotingFeatures, setHasVotingFeatures] = useState(!!data.hasVotingFeatures);
  const [hasTokenCounter, setHasTokenCounter] = useState(!!data.hasTokenCounter);
  const [isTeamAssessment, setIsTeamAssessment] = useState(false);
  const [isVotingPublished] = useState(!!data.isVotingPublished);
  const [confirmAssignEntries, setConfirmAssignEntries] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  // Updates assessment overview with changes to hasVotingFeatures and hasTokenCounter
  const handleConfigure = useCallback(() => {
    const { id } = data;
    handleConfigureAssessment(id, hasVotingFeatures, hasTokenCounter);
    handleCloseDialog();
  }, [data, handleCloseDialog, handleConfigureAssessment, hasTokenCounter, hasVotingFeatures]);

  // Toggles in configuration pannel
  const toggleHasTokenCounter = useCallback(() => setHasTokenCounter(prev => !prev), []);
  const toggleVotingFeatures = useCallback(() => setHasVotingFeatures(prev => !prev), []);
  const toggleIsTeamAssessment = useCallback(() => setIsTeamAssessment(prev => !prev), []);

  // OnClick and Handler functions for confirmation warnings when assigning entries for voting
  const onAssignClick = useCallback(() => setConfirmAssignEntries(true), []);
  const handleConfirmAssign = useCallback(() => {
    const { id } = data;
    handleAssignEntriesForVoting(id);
  }, [data, handleAssignEntriesForVoting]);
  const handleCancelAssign = useCallback(() => setConfirmAssignEntries(false), []);

  return (
    <>
      <ControlButton icon={IconNames.COG} onClick={handleOpenDialog} />
      <Dialog
        icon={IconNames.Cog}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Configuring assessment"
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>
            This <b>configuration tool</b> allows you to fine-tune this assessment. Any changes made
            here will <b>override</b> any assessment configurations in the admin panel.
          </p>
          <div className="general-configs">
            <p>
              <b>General Configurations</b>
            </p>
            <Divider />
            <Switch
              className="has-token-counter"
              checked={hasTokenCounter}
              onChange={toggleHasTokenCounter}
              inline
              label="Enable token counter"
            />
          </div>
          <div className="team-related-configs">
            <p>
              <b>Team-Related Configurations</b>
            </p>
            <Divider />
            <Switch
              className="is-team-assessment"
              onChange={toggleIsTeamAssessment}
              inline
              label="Is team assessment"
            />
            <Collapse isOpen={isTeamAssessment}>
              <div className="numeric-input-container">
                <Team />
                <p className="max-team-size">Max team size</p>
                <NumericInput />
              </div>
            </Collapse>
          </div>
          <div className="voting-related-configs">
            <p>
              <b>Voting-Related Configurations</b>
            </p>
            <Divider />
            <Switch
              className="has-voting-features"
              checked={hasVotingFeatures}
              onChange={toggleVotingFeatures}
              inline
              label="Enable voting features"
            />
            <Collapse isOpen={hasVotingFeatures}>
              <div className="voting-related-controls">
                <div className="control-button-container">
                  <ControlButton
                    icon={IconNames.PEOPLE}
                    isDisabled={true}
                    label="Export Popular Vote Leaderboard (Coming soon!)"
                  />
                </div>
                <div className="control-button-container">
                  <ControlButton
                    icon={IconNames.CROWN}
                    isDisabled={true}
                    label="Export Score Leaderboard (Coming soon!)"
                  />
                </div>
                <div className="current-voting-status">
                  <InfoSign />
                  <p className="voting-status-text">
                    Current Voting Status: Entries have {!isVotingPublished && <b>not </b>} been
                    assigned
                  </p>
                </div>
                {!confirmAssignEntries ? (
                  <div className="control-button-container">
                    <ControlButton
                      icon={IconNames.RESET}
                      onClick={onAssignClick}
                      label={`${!isVotingPublished ? 'Assign' : 'Reassign'} entries for voting`}
                    ></ControlButton>
                  </div>
                ) : (
                  <div className="confirm-assign-voting">
                    <Reset />
                    <p className="confirm-assign-text">
                      Are you sure you want to{' '}
                      <b>{isVotingPublished ? 're-assign' : 'assign'} entries?</b>
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
                  <p className="reassign-voting-warning">
                    <b>All existing votes</b> will be <b>deleted</b> upon reassigning entries!
                  </p>
                )}
              </div>
            </Collapse>
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <ControlButton
              label="Save"
              icon={IconNames.UPLOAD}
              onClick={handleConfigure}
              options={{ minimal: false, intent: Intent.PRIMARY }}
            />
          }
        ></DialogFooter>
      </Dialog>
    </>
  );
};

export default ConfigureCell;
