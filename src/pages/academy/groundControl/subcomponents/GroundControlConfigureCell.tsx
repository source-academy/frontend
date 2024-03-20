import { Dialog, DialogBody, DialogFooter, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { ChangeEvent, ChangeEventHandler, useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handleAssessmentConfigure: (id: number, hasVotingFeatures: boolean, useCounter: boolean) => void;
  data: AssessmentOverview;
};

const ConfigureCell: React.FC<Props> = ({ handleAssessmentConfigure, data }) => {
  const [isDialogOpen, setDialogState] = useState(false);
  const [hasVotingFeatures, setHasVotingFeatures] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleConfigure = (hasVotingFeatures: boolean, useCounter: boolean) => {
    const { id } = data;
    handleAssessmentConfigure(id, hasVotingFeatures, useCounter);
    handleCloseDialog();
  };

  const handleVotingFeaturesChange = () => {
    setHasVotingFeatures(!hasVotingFeatures);
  };
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
          <Switch
            className="has-voting-features"
            checked={hasVotingFeatures}
            onChange={handleVotingFeaturesChange}
            inline
            label="Has Voting Features"
          ></Switch>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <ControlButton
                label="Save"
                icon={IconNames.Saved}
                options={{ minimal: false, intent: Intent.SUCCESS }}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
};

export default ConfigureCell;
