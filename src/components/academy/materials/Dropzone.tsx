/* tslint:disable:no-console */
import { Card, Elevation } from '@blueprintjs/core';
import { FlexDirectionProperty } from 'csstype';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

interface IDropzoneType {
  handleUploadMaterial: (file: File) => void;
}

// Dropzone styling
const dropZoneStyle = {
  baseStyle: {
    flex: 1,
    display: 'flex',
    height: '40vh',
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

const MaterialDropzone: React.FC<IDropzoneType> = props => {
  const [state, setState] = React.useState({
    files: [] as File[]
  });
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused
  } = useDropzone({
    onDrop: acceptedFiles => {
      console.log(acceptedFiles);
      setState({
        ...state,
        files: acceptedFiles
      });
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

  return (
    <>
      <Card className="contentdisplay-content" elevation={Elevation.THREE}>
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </Card>
      {state.files &&
        state.files.map((file, index) => (
          <Card key={index}>
            <div>{file.name}</div>
          </Card>
        ))}
    </>
  );
};

export default MaterialDropzone;
