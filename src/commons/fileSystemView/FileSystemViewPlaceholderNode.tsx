import React from 'react';
import classes from 'src/styles/FileSystemView.module.scss';

type Props = {
  processFileName: (fileName: string) => void;
  removePlaceholder: () => void;
};

const FileSystemViewPlaceholderNode: React.FC<Props> = ({ processFileName, removePlaceholder }) => {
  const [fileName, setFileName] = React.useState('');

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
};

export default FileSystemViewPlaceholderNode;
