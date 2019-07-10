/* tslint:disable:no-console */
import { Card, Elevation } from '@blueprintjs/core';
import * as React from 'react';
import Dropzone, { DropzoneState } from 'react-dropzone';

const MaterialDropzone: React.FC = () => {
  const handleOnDrop = (acceptedFiles: any) => console.log(acceptedFiles);

  return (
    <Card className="contentdisplay-content" elevation={Elevation.THREE}>
      <Dropzone onDrop={handleOnDrop}>
        {({ getRootProps, getInputProps }: DropzoneState) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone>
    </Card>
  );
};

export default MaterialDropzone;
