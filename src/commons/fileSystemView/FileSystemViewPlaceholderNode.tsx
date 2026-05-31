import { useState } from 'react';

import classes from './FileSystemView.module.css';

type Props = {
  processFileName: (fileName: string) => void;
  removePlaceholder: () => void;
};

function FileSystemViewPlaceholderNode({ processFileName, removePlaceholder }: Props) {
  const [fileName, setFileName] = useState('');

  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFileName(e.target.value);
  const handleInputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processFileName(fileName);
      removePlaceholder();
    } else if (e.key === 'Escape') {
      handleInputOnBlur();
    }
  };
  const handleInputOnBlur = () => removePlaceholder();

  return (
    <input
      type="text"
      autoFocus
      spellCheck={false}
      className={classes['file-system-view-input']}
      value={fileName}
      onChange={handleInputOnChange}
      onKeyDown={handleInputOnKeyDown}
      onBlur={handleInputOnBlur}
    />
  );
}

export default FileSystemViewPlaceholderNode;
