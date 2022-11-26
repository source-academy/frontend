import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';

import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import controlButton from '../ControlButton';

type SourceRecorderDeleteCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeleteSourcecastEntry: (id: number) => void;
};

type StateProps = {
  data: SourcecastData;
};

const SourceRecorderDeleteCell: React.FC<SourceRecorderDeleteCellProps> = props => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => setDialogOpen(false);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleDelete = () => {
    const { data } = props;
    props.handleDeleteSourcecastEntry(data.id);
  };

  return (
    <div>
      {controlButton('', IconNames.TRASH, handleOpenDialog)}
      <Dialog
        icon="info-sign"
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        title="Delete Sourcecast"
        canOutsideClickClose={true}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>Are you sure to delete this sourcecast entry?</p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {controlButton('Confirm Delete', IconNames.TRASH, handleDelete)}
            {controlButton('Cancel', IconNames.CROSS, handleCloseDialog)}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SourceRecorderDeleteCell;
