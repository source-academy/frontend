import { Collapse, Dialog, DialogBody, Divider, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handleAssessmentVotingFeaturesChange: (id: number, hasVotingFeatures: boolean) => void;
  handleAssessmentTokenCounterChange: (id: number, hasTokenCounter: boolean) => void;
  data: AssessmentOverview;
};

const ConfigureCell: React.FC<Props> = ({
  handleAssessmentTokenCounterChange,
  handleAssessmentVotingFeaturesChange,
  data
}) => {
  const [isDialogOpen, setDialogState] = useState(false);
  const [hasVotingFeatures] = useState(!!data.hasVotingFeatures);
  const [hasTokenCounter] = useState(!!data.hasTokenCounter);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleToggleHasVotingFeatures = useCallback(() => {
    const { id } = data;
    handleAssessmentVotingFeaturesChange(id, !hasVotingFeatures);
  }, [data, handleAssessmentVotingFeaturesChange, hasVotingFeatures]);

  const handleToggleHasTokenCounter = useCallback(() => {
    const { id } = data;
    handleAssessmentTokenCounterChange(id, !hasTokenCounter);
  }, [data, handleAssessmentTokenCounterChange, hasTokenCounter]);

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
            onChange={handleToggleHasVotingFeatures}
            inline
            label="Enable Voting Features"
          ></Switch>
          <Collapse isOpen={hasVotingFeatures}>
            <Switch
              className="has-token-counter"
              checked={hasTokenCounter}
              onChange={handleToggleHasTokenCounter}
              inline
              label="Has Token Counter"
            ></Switch>
          </Collapse>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default ConfigureCell;
