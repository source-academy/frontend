import { IconNames } from '@blueprintjs/icons';

import { SideContentLocation, SideContentTab, SideContentType } from '../SideContentTypes';

export type UploadResult = {
  [key: string]: any;
};

type OwnProps = {
  workspaceLocation: SideContentLocation;
  onUpload: (files: UploadResult) => void;
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
const SideContentUpload = (props: OwnProps) => {
  return (
    <div>
      <p>Bypass the compiler and type checker by uploading class files to run in the JVM.</p>
      <p>
        Only .class files are accepted. Code in the editor will be ignored when running while this
        tab is active.
      </p>
      <p>
        Compile the files with the following command:
        <code>javac *.java -target 8 -source 8</code>
      </p>
      <p>Avoid running class files downloaded from unknown sources.</p>
      <strong>Main class must be named Main and uploaded as Main.class.</strong>
      <input
        type="file"
        multiple
        accept=".class"
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
            props.onUpload(ret);
          });
        }}
      />
    </div>
  );
};

const makeUploadTabFrom = (
  location: SideContentLocation,
  onUpload: (files: UploadResult) => void
): SideContentTab => ({
  label: 'Upload files',
  iconName: IconNames.Upload,
  body: <SideContentUpload workspaceLocation={location} onUpload={onUpload} />,
  id: SideContentType.upload
});

export default makeUploadTabFrom;
