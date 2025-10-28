import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import ControlButton from '../ControlButton';

type SourceRecorderDeleteCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeleteSourcecastEntry: (id: number) => void;
};

type StateProps = {
  data: SourcecastData;
};

const SourceRecorderDeleteCell: React.FC<SourceRecorderDeleteCellProps> = props => {
  const { t } = useTranslation('translation', { keyPrefix: 'sourceRecorder' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCloseDialog = () => setIsDialogOpen(false);
  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleDelete = () => {
    const { data } = props;
    props.handleDeleteSourcecastEntry(data.id);
  };

  return (
    <div>
      <ControlButton icon={IconNames.TRASH} onClick={handleOpenDialog} />
      <Dialog
        icon="info-sign"
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={t('deleteTitle')}
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>{t('deleteConfirmation')}</p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <ControlButton
                label={t('confirmDelete')}
                icon={IconNames.TRASH}
                onClick={handleDelete}
              />
              <ControlButton
                label={t('cancel')}
                icon={IconNames.CROSS}
                onClick={handleCloseDialog}
              />
            </>
          }
        />
      </Dialog>
    </div>
  );
};

export default SourceRecorderDeleteCell;
