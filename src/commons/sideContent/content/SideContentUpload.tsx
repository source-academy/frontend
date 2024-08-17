import { FileInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback } from 'react';

import { SideContentTab, SideContentType } from '../SideContentTypes';

export type UploadResult = {
  [key: string]: any;
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

type Props = {
  onUpload: (files: UploadResult) => void;
};

/**
 * This component is responsible for uploading Java class files to bypass the compiler.
 */
const SideContentUpload: React.FC<Props> = ({ onUpload }) => {
  const [count, setCount] = React.useState(0);

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
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
        onUpload(ret);
        setCount(promises.length);
      });
    },
    [onUpload]
  );

  return (
    <div>
      <p>Bypass the compiler and type checker by uploading class files to run in the JVM.</p>
      <p>
        Only .class files are accepted. Code in the editor will be ignored when running while this
        tab is active.
      </p>
      <p>Compile the files with the following command:</p>
      <pre>
        <code>javac *.java -target 8 -source 8</code>
      </pre>
      <p>Avoid running class files downloaded from unknown sources.</p>
      <p>
        <strong>Main class must be named Main and uploaded as Main.class.</strong>
      </p>
      <FileInput
        inputProps={{ multiple: true, accept: '.class' }}
        onInputChange={handleFileUpload}
        text={count === 0 ? 'Choose files...' : `${count} file(s) uploaded.`}
      />
    </div>
  );
};

const makeUploadTabFrom = (onUpload: (files: UploadResult) => void): SideContentTab => ({
  label: 'Upload files',
  iconName: IconNames.Upload,
  body: <SideContentUpload onUpload={onUpload} />,
  id: SideContentType.upload
});

export default makeUploadTabFrom;
