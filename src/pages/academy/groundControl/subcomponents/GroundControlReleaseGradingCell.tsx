import { Button, Dialog, DialogBody, DialogFooter, Intent, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import React, { useCallback, useMemo, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type MassPublishFn = (id: number) => void;

type Props = {
  handlePublishGradingAll: MassPublishFn;
  handleUnpublishGradingAll: MassPublishFn;
  data: AssessmentOverview;
};

const ReleaseGradingCell: React.FC<Props> = ({
  data,
  handlePublishGradingAll,
  handleUnpublishGradingAll
}) => {
  const cells = useMemo(
    () => massPublishingChanges(data, handlePublishGradingAll, handleUnpublishGradingAll),
    [data, handlePublishGradingAll, handleUnpublishGradingAll]
  );

  return (
    <>
      {cells.map(props => (
        <MassPublishingChangeCell {...props} key={props.keyID} />
      ))}
    </>
  );
};

type SubProps = {
  keyID: string;
  callbackFn: MassPublishFn;
  data: AssessmentOverview;
  change: string;
  description: string;
  icon: IconName;
};

const massPublishingChanges = (
  data: AssessmentOverview,
  publishAll: MassPublishFn,
  unpublishAll: MassPublishFn
): SubProps[] => [
  {
    keyID: '1',
    callbackFn: unpublishAll,
    data: data,
    change: 'Unpublish all submissions',
    description: 'Non-published submissions are not affected.',
    icon: IconNames.CROSS_CIRCLE
  },
  {
    keyID: '2',
    callbackFn: publishAll,
    data: data,
    change: 'Publish all graded submissions',
    description: 'Ungraded or already-published submissions are not affected.',
    icon: IconNames.ENDORSED
  }
];

const MassPublishingChangeCell: React.FC<SubProps> = ({
  keyID,
  callbackFn,
  data,
  change,
  description,
  icon
}) => {
  const [isDialogOpen, setDialogState] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleMassPublishChange = useCallback(() => {
    const { id } = data;
    callbackFn(id);
    handleCloseDialog();
  }, [data, handleCloseDialog, callbackFn]);

  return (
    <>
      <Tooltip content={change} placement="top">
        <Button minimal key={keyID} onClick={handleOpenDialog} icon={icon} />
      </Tooltip>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={change}
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>
            Are you sure you want to {change.toLowerCase()} for the assessment: <i>{data.title}</i>?
          </p>
          <p>{description}</p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <ControlButton
                label="Cancel"
                icon={IconNames.CROSS}
                onClick={handleCloseDialog}
                options={{ minimal: false }}
              />
              <ControlButton
                label="Confirm"
                icon={IconNames.CONFIRM}
                onClick={handleMassPublishChange}
                options={{ minimal: false, intent: Intent.DANGER }}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
};

export default ReleaseGradingCell;
