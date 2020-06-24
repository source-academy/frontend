import 'ace-builds/webpack-resolver';
import * as React from 'react';

function CheckpointTxtLoader() {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Object.values(e.target.files || []);
    files.map(loadFileLocally);
  }

  return (
    <div className="LeftAlign">
      <input type="file" onChange={onChange} style={{ width: '250px' }} />
    </div>
  );
}

function loadFileLocally(txtFile: File) {
  const reader = new FileReader();
  reader.readAsText(txtFile);
  reader.onloadend = _ => {
    if (!reader.result) {
      return;
    }
    sessionStorage.setItem('checkpointTxt', reader.result.toString());
  };
}

export default CheckpointTxtLoader;
