import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React from 'react';

import { SideContentLocation, SideContentTab, SideContentType } from '../SideContentTypes';

type OwnProps = {
  workspaceLocation: SideContentLocation;
  onUpload: (files: { [key: string]: any }) => void;
};

async function getBase64(file: Blob, onFinish: (result: string) => void) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.readAsDataURL(file);
    reader.onload = () => {
      onFinish((reader.result as string).slice(37));
      resolve(reader.result);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * This class is responsible for uploading Java class files to bypass the compiler.
 */
class SideContentUpload extends React.Component<OwnProps> {
  public render() {
    return (
      <div className={classNames('sa-data-visualizer', Classes.DARK)}>
        <p>
          Upload class files to run in the JVM.
          <br />
          <br />
          Code in the editor will be ignored when running while this tab is active.
          <br />
        </p>
        <input
          type="file"
          multiple
          onChange={e => {
            const ret: { [key: string]: string } = {};
            const promises = [];
            for (const file of e.target.files ?? []) {
              if (file.name.endsWith('.class')) {
                promises.push(
                  getBase64(file, (b64: string) => {
                    ret[file.name] = b64;
                  })
                );
              }
            }
            Promise.all(promises).then(() => {
              this.props.onUpload(ret);
            });
          }}
        />
      </div>
    );
  }
}

const makeUploadTabFrom = (
  location: SideContentLocation,
  onUpload: (files: { [key: string]: any }) => void
): SideContentTab => ({
  label: 'Upload files',
  iconName: IconNames.Upload,
  body: <SideContentUpload workspaceLocation={location} onUpload={onUpload} />,
  id: SideContentType.upload
});

export default makeUploadTabFrom;
