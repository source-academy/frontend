import { Card, Elevation, Intent, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import controlButton from '../../../../commons/ControlButton';
import { showWarningMessage } from '../../../../commons/utils/NotificationsHelper';

interface IDispatchProps {
  handleUploadAssessment: (file: File) => void;
  toggleForceUpdate: () => void;
  toggleDisplayConfirmation: () => void;
}

interface IStateProps {
  forceUpdate: boolean;
  displayConfirmation: boolean;
}

interface IDropzoneProps extends IDispatchProps, IStateProps {}

const MaterialDropzone: React.FunctionComponent<IDropzoneProps> = props => {
  const [file, setFile] = React.useState<File>();
  const [title, setTitle] = React.useState<string>();

  const handleConfirmUpload = () => {
    props.handleUploadAssessment(file!);
    setFile(undefined);
  };
  const handleCancelUpload = () => setFile(undefined);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused
  } = useDropzone({
    multiple: false,
    onDropAccepted: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setTitle(acceptedFiles[0].name);
    },
    onDropRejected: rejectedFiles => {
      if (rejectedFiles.length > 1) {
        showWarningMessage('Uploading multiple files at once is not currently supported!', 2000);
      }
    }
  });

  const classList = React.useMemo(() => {
    return classNames(
      'dropzone-base',
      isFocused || isDragActive ? 'dropzone-active' : undefined,
      isDragAccept ? 'dropzone-accept' : undefined,
      isDragReject ? 'dropzone-reject' : undefined
    );
  }, [isDragActive, isDragAccept, isDragReject, isFocused]);

  const handleToggleOnChange = () => {
    if (!props.forceUpdate) {
      props.toggleDisplayConfirmation();
      props.toggleForceUpdate();
    } else {
      props.toggleForceUpdate();
    }
  };

  const toggleButton = () => {
    return (
      <div className="toggle-button-wrapper">
        <Switch checked={props.forceUpdate} onChange={handleToggleOnChange} />
      </div>
    );
  };

  const handleConfirmForceUpdate = () => {
    props.toggleDisplayConfirmation();
  };

  const handleCancelForceUpdate = () => {
    props.toggleDisplayConfirmation();
    props.toggleForceUpdate();
  };

  const confirmationMessage = () => (
    <div className="dropzone-controls">
      {controlButton('Yes', IconNames.CONFIRM, handleConfirmForceUpdate, {
        minimal: false,
        intent: Intent.DANGER
      })}
      {controlButton('No', IconNames.CROSS, handleCancelForceUpdate, {
        minimal: false
      })}
    </div>
  );

  return (
    <>
      <Card elevation={Elevation.TWO} interactive={true}>
        <div {...getRootProps({ className: classList })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop a file here, or click to select a file</p>
        </div>
      </Card>
      {file && (
        <Card className="dropzone-prompt" elevation={Elevation.TWO} interactive={true}>
          <h3>{title}</h3>
          {!props.displayConfirmation && (
            <>
              <div className="dropzone-controls">
                {controlButton('Confirm Upload', IconNames.UPLOAD, handleConfirmUpload, {
                  minimal: false,
                  intent: Intent.DANGER
                })}
                {controlButton('Cancel Upload', IconNames.DELETE, handleCancelUpload, {
                  minimal: false
                })}
              </div>
              <div className="dropzone-controls">
                <p>Force update opened assessment</p>
                {toggleButton()}
              </div>
            </>
          )}
          {props.displayConfirmation && (
            <p>Are you sure that you want to force update the assessment?</p>
          )}
          {props.displayConfirmation && confirmationMessage()}
        </Card>
      )}
    </>
  );
};

export default MaterialDropzone;
