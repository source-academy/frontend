import * as React from 'react';
import 'ace-builds/webpack-resolver';
import { Button, Checkbox } from '@blueprintjs/core';
import { uploadAsset } from 'src/features/storySimulator/StorySimulatorService';

type Props = {
  title: string;
  storageName: string;
  accessToken?: string;
};

function CheckpointTxtLoader({ title, storageName, accessToken }: Props) {
  const [loadedFile, setLoadedFile] = React.useState<File>();
  const [useOwnTxt, setUseOwnTxt] = React.useState(true);

  function onLoadTxt(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const [file] = e.target.files;

    setLoadedFile(file);
    loadFileLocally(storageName, file);
  }

  React.useEffect(() => {}, [useOwnTxt]);

  async function onUploadButtonClick() {
    if (!accessToken || !loadedFile) return;
    console.log(loadedFile.name);
    const resp = await uploadAsset(accessToken, loadedFile, 'stories', loadedFile.name, ['text']);
    alert(resp);
  }

  const toggleSwitch = (useOwnTxt: boolean) => (e: any) => {
    setUseOwnTxt(useOwnTxt);
    e.target.checked = !e.target.checked;
  };

  return (
    <div className="LeftAlign">
      <b>{title}</b>
      <Checkbox checked={false} onChange={toggleSwitch(false)}>
        Simulate selected file
      </Checkbox>
      <Checkbox checked={true} onChange={toggleSwitch(true)}>
        Simulate with your .txt
      </Checkbox>

      <input type="file" onChange={onLoadTxt} style={{ width: '250px' }} />
      <Button onClick={onUploadButtonClick}>Upload</Button>
    </div>
  );
}

const loadFileLocally = (storageName: string, txtFile: File) => {
  const reader = new FileReader();
  reader.readAsText(txtFile);
  reader.onloadend = _ => {
    if (!reader.result) {
      return;
    }
    sessionStorage.setItem(storageName, reader.result.toString());
  };
};

export default CheckpointTxtLoader;
