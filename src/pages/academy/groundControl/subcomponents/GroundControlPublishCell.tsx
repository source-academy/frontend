import { Dialog, DialogBody, DialogFooter, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handlePublishAssessment: (togglePublishAssessmentTo: boolean, id: number) => void;
  data: AssessmentOverview;
};

const PublishCell: React.FC<Props> = ({ data, handlePublishAssessment }) => {
  const [isDialogOpen, setDialogState] = useState(false);
  const [isPublished] = useState(!!data.isPublished);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleTogglePublished = useCallback(() => {
    const { id } = data;
    handlePublishAssessment(!isPublished, id);
    handleCloseDialog();
  }, [data, isPublished, handleCloseDialog, handlePublishAssessment]);

  return (
    <>
      <Switch className="publish-cell" checked={isPublished} onChange={handleOpenDialog} />
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={`${isPublished ? 'Unpublish' : 'Publish'} assessment`}
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>
            Are you sure you want to <b>{isPublished ? 'unpublish' : 'publish'}</b> the assessment{' '}
            <i>{data.title}</i>?
          </p>
          {isPublished ? (
            <p>
              <b>
                This will hide the assessment for students and prevent them from uploading new
                answers. Admins and staff are not affected.
              </b>
            </p>
          ) : null}
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

export default PublishCell;
