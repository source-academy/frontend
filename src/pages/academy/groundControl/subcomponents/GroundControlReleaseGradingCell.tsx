import { Button, Dialog, DialogBody, DialogFooter, Icon, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handlePublishGradingAll: (id: number) => void;
  handleUnpublishGradingAll: (id: number) => void;
  data: AssessmentOverview;
};

const ReleaseGradingCell: React.FC<Props> = ({ data, handlePublishGradingAll, handleUnpublishGradingAll }) => {
  const [isDialogOpen, setDialogState] = useState(false);
  // this refers to publishing the assessment, NOT publishing all gradings for the assessment.
  const [isPublished] = useState(!!data.isPublished);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleTogglePublished = useCallback(() => {
    const { id } = data;
    handlePublishGradingAll(id);
    handleCloseDialog();
  }, [data, handleCloseDialog, handlePublishGradingAll]);

  return (
    <>
      <Button className="release-grading-cell" onClick={handleOpenDialog} icon={IconNames.ENDORSED} color={'blue'} />
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={`${isPublished ? 'Unpublish' : 'Publish'} assessment`}
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>
            Are you sure you want to release the grading of all graded submissions for the assessment?{' '}
            <i>{data.title}</i>?

            Ungraded submissions or already-published submissions are not affected.
          </p>
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
