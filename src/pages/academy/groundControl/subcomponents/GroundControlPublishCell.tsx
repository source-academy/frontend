import { Classes, Dialog, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

export type PublishCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handlePublishAssessment: (togglePublishTo: boolean, id: number) => void;
};

type StateProps = {
  data: AssessmentOverview;
};

const PublishCell: React.FunctionComponent<PublishCellProps> = props => {
  const { data } = props;

  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);
  const [isPublished] = React.useState<boolean>(!!data.isPublished);

  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const { handlePublishAssessment } = props;

  const handleTogglePublished = React.useCallback(() => {
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
        <div className={Classes.DIALOG_BODY}>
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
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
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
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PublishCell;
