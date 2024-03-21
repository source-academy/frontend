import {
  Collapse,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Intent,
  Switch
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
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

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleConfigure = useCallback(() => {
    const { id } = data;
    handleConfigureAssessment(id, hasVotingFeatures, hasTokenCounter);
  }, [data, handleConfigureAssessment, hasTokenCounter, hasVotingFeatures]);

  const toggleHasTokenCounter = useCallback(
    () => setHasTokenCounter(!hasTokenCounter),
    [hasTokenCounter]
  );
  const toggleVotingFeatures = useCallback(
    () => setHasVotingFeatures(!hasVotingFeatures),
    [hasVotingFeatures]
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
            This <b>assessment configuration tool</b> allows you to fine-tune this assessment to
            ensure it meets your specific <b>needs.</b>
          </p>
          <br></br>
          <p>
            <b>Voting-Related Configurations</b>
          </p>
          <Divider></Divider>
          <Switch
            className="has-voting-features"
            checked={hasVotingFeatures}
            onChange={toggleVotingFeatures}
            inline
            label="Enable Voting Features"
          ></Switch>
          <Collapse isOpen={hasVotingFeatures}>
            <Switch
              className="has-token-counter"
              checked={hasTokenCounter}
              onChange={toggleHasTokenCounter}
              inline
              label="Has Token Counter"
            ></Switch>
          </Collapse>
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
