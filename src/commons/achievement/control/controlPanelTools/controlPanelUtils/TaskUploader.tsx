import { Button } from '@blueprintjs/core';

type TaskUploaderProps = {
  pendingUpload: boolean;
  uploadChanges: any;
};

function TaskUploader(props: TaskUploaderProps) {
  const { pendingUpload, uploadChanges } = props;

  return (
    <>
      {pendingUpload && (
        <Button
          className={'main-adder'}
          icon={'export'}
          text={'Publish changes'}
          intent={'primary'}
          onClick={uploadChanges}
        />
      )}
    </>
  );
}

export default TaskUploader;
