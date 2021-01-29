import { Button } from '@blueprintjs/core';

type AchievementUploaderProps = {
  hasChanges: boolean;
  saveChanges: any;
  discardChanges: any;
  pendingUpload: boolean;
  uploadChanges: any;
};

function AchievementUploader(props: AchievementUploaderProps) {
  const { hasChanges, saveChanges, discardChanges, pendingUpload, uploadChanges } = props;

  return (
    <>
      {hasChanges ? (
        <>
          <Button
            icon={'floppy-disk'}
            text={'Save'}
            intent={'primary'}
            outlined={true}
            onClick={saveChanges}
          />
          <Button
            icon={'cross'}
            text={'Discard'}
            intent={'danger'}
            outlined={true}
            onClick={discardChanges}
          />
        </>
      ) : pendingUpload ? (
        <Button icon={'export'} text={'Submit'} intent={'primary'} onClick={uploadChanges} />
      ) : null}
    </>
  );
}

export default AchievementUploader;
