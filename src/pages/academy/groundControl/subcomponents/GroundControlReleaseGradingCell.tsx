import { Button, Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';
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
        <MassPublishingChangeCell {...props} />
      ))}
    </>
  );
};

type SubProps = {
  key: string,
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
    key: '1',
    callbackFn: unpublishAll,
    data: data,
    change: 'Unpublish all submissions',
    description: 'Non-published submissions are not affected.',
    icon: IconNames.CROSS_CIRCLE
  },
  {
    key: '2',
    callbackFn: publishAll,
    data: data,
    change: 'Publish graded submissions',
    description: 'Ungraded or already-published submissions are not affected.',
    icon: IconNames.ENDORSED
  }
];

const MassPublishingChangeCell: React.FC<SubProps> = ({
  key,
  callbackFn,
  data,
  change,
  description,
  icon
}) => {
  const [isDialogOpen, setDialogState] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleTogglePublished = useCallback(() => {
    const { id } = data;
    callbackFn(id);
    handleCloseDialog();
  }, [data, handleCloseDialog, callbackFn]);

  return (
    <>
      <Button className={change} key={key} onClick={handleOpenDialog} icon={icon} />
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={change}
        canOutsideClickClose={true}
        key={key + '-dialog'}
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
                onClick={handleTogglePublished}
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
