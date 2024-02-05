import React from 'react';
import classes from 'src/styles/FileSystemView.module.scss';

export type FileSystemViewPlaceholderNodeProps = {
  processFileName: (fileName: string) => void;
  removePlaceholder: () => void;
};

const FileSystemViewPlaceholderNode: React.FC<FileSystemViewPlaceholderNodeProps> = (
  props: FileSystemViewPlaceholderNodeProps
) => {
  const { processFileName, removePlaceholder } = props;

  const [fileName, setFileName] = React.useState<string>('');

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
