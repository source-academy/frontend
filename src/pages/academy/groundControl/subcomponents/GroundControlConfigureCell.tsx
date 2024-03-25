import {
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Intent,
  NumericInput,
  Switch
} from '@blueprintjs/core';
import { IconNames, Team } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handleConfigureAssessment: (
    id: number,
    hasVotingFeatures: boolean,
    hasTokenCounter: boolean
  ) => void;
  data: AssessmentOverview;
};

const ConfigureCell: React.FC<Props> = ({ handleConfigureAssessment, data }) => {
  const [isDialogOpen, setDialogState] = useState(false);
  const [hasVotingFeatures, setHasVotingFeatures] = useState(!!data.hasVotingFeatures);
  const [hasTokenCounter, setHasTokenCounter] = useState(!!data.hasTokenCounter);
  const [isTeamAssessment, setIsTeamAssessment] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleConfigure = useCallback(() => {
    const { id } = data;
    handleConfigureAssessment(id, hasVotingFeatures, hasTokenCounter);
    handleCloseDialog();
  }, [data, handleCloseDialog, handleConfigureAssessment, hasTokenCounter, hasVotingFeatures]);

  const toggleHasTokenCounter = useCallback(
    () => setHasTokenCounter(!hasTokenCounter),
    [hasTokenCounter]
  );
  const toggleVotingFeatures = useCallback(
    () => setHasVotingFeatures(!hasVotingFeatures),
    [hasVotingFeatures]
  );
  const toggleIsTeamAssessment = useCallback(
    () => setIsTeamAssessment(!isTeamAssessment),
    [isTeamAssessment]
  );

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
            <Divider></Divider>
            <Switch
              className="has-token-counter"
              checked={hasTokenCounter}
              onChange={toggleHasTokenCounter}
              inline
              label="Enable token counter"
            ></Switch>
          </div>
          <div className="team-related-configs">
            <p>
              <b>Team-Related Configurations</b>
            </p>
            <Divider></Divider>
            <Switch
              className="is-team-assessment"
              onChange={toggleIsTeamAssessment}
              inline
              label="Is team assessment"
            ></Switch>
            <Collapse isOpen={isTeamAssessment}>
              <div className="numeric-input-container">
                <Team></Team>
                <p className="max-team-size">Max team size</p>
                <NumericInput></NumericInput>
              </div>
            </Collapse>
          </div>
          <div className="voting-related-configs">
            <p>
              <b>Voting-Related Configurations</b>
            </p>
            <Divider></Divider>
            <Switch
              className="has-voting-features"
              checked={hasVotingFeatures}
              onChange={toggleVotingFeatures}
              inline
              label="Enable voting features"
            ></Switch>
            <Collapse isOpen={hasVotingFeatures}>
              <div className="voting-related-controls">
                <div className="control-button-container">
                  <ControlButton
                    icon={IconNames.PEOPLE}
                    isDisabled={true}
                    label="Export Popular Vote Leaderboard (Coming soon!)"
                  ></ControlButton>
                </div>
                <div className="control-button-container">
                  <ControlButton
                    icon={IconNames.CROWN}
                    isDisabled={true}
                    label="Export Score Leaderboard (Coming soon!)"
                  ></ControlButton>
                </div>
                <Switch
                  className="publish-voting"
                  disabled={true}
                  inline
                  label="Publish Voting (Coming soon!)"
                ></Switch>
              </div>
            </Collapse>
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <ControlButton
                label="Save"
                icon={IconNames.UPLOAD}
                onClick={handleConfigure}
                options={{ minimal: false, intent: Intent.PRIMARY }}
              />
            </>
          }
        ></DialogFooter>
      </Dialog>
    </>
  );
};

export default ConfigureCell;
