import { Card, Elevation, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { FlexDirectionProperty } from 'csstype';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import { controlButton } from '../commons';

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

// Dropzone styling
const dropZoneStyle = {
  baseStyle: {
    flex: 1,
    display: 'flex',
    height: '30vh',
    flexDirection: 'column' as FlexDirectionProperty,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  },

  activeStyle: {
    borderColor: '#2196f3'
  },

  acceptStyle: {
    borderColor: '#00e676'
  },

  rejectStyle: {
    borderColor: '#ff1744'
  }
};

const MaterialDropzone: React.FC<IDropzoneProps> = props => {
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
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setTitle(acceptedFiles[0].name);
    }
  });
  const style = React.useMemo(
    () => ({
      ...dropZoneStyle.baseStyle,
      ...(isDragActive ? dropZoneStyle.activeStyle : {}),
      ...(isDragAccept ? dropZoneStyle.acceptStyle : {}),
      ...(isDragReject ? dropZoneStyle.rejectStyle : {}),
      ...(isFocused ? dropZoneStyle.activeStyle : {})
    }),
    [isDragActive, isDragAccept, isDragReject, isFocused]
  );

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

  const confirmationMessage = () => {
    return (
      <div>
        <p>Are you sure that you want to force update the assessment?</p>
        {controlButton('Yes', IconNames.CONFIRM, handleConfirmForceUpdate)}
        {controlButton('No', IconNames.CROSS, handleCancelForceUpdate)}
      </div>
    );
  };

  return (
    <>
      <Card className="contentdisplay-content" elevation={Elevation.THREE}>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </Card>
      {file && (
        <Card>
          <div>{title}</div>
          <br />
          {!props.displayConfirmation &&
            controlButton('Confirm Upload', IconNames.UPLOAD, handleConfirmUpload)}
          {!props.displayConfirmation &&
            controlButton('Cancel Upload', IconNames.DELETE, handleCancelUpload)}
          <br />
          <br />
          {!props.displayConfirmation && <p>Force update opened assessment</p>}
          {props.displayConfirmation && confirmationMessage()}
          {!props.displayConfirmation && toggleButton()}
        </Card>
      )}
    </>
  );
};

export default MaterialDropzone;
