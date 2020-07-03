import * as React from 'react';
import 'ace-builds/webpack-resolver';
import { gameTxtStorageName } from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';

type Props = {
  title: string;
  storageName: string;
  clearStorage: boolean;
};

function CheckpointTxtLoader({ title, storageName, clearStorage }: Props) {
  if (clearStorage) {
    clearSessionStorage();
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const [file] = e.target.files;
    loadFileLocally(storageName, file);
  }

  return (
    <div className="LeftAlign">
      {title}
      <input type="file" onChange={onChange} style={{ width: '250px' }} />
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

function clearSessionStorage() {
  sessionStorage.setItem(gameTxtStorageName.checkpointTxt, '');
  sessionStorage.setItem(gameTxtStorageName.defaultChapter, '');
}

export default CheckpointTxtLoader;
