import React from 'react';

import EditorTab from './EditorTab';
import { getShortestUniqueFilePaths } from './utils';

export type EditorTabContainerProps = {
  baseFilePath: string;
  filePaths: string[];
  activeEditorTabIndex: number;
  setActiveEditorTabIndex: (activeEditorTabIndex: number | null) => void;
  removeEditorTabByIndex: (editorTabIndex: number) => void;
};

const EditorTabContainer: React.FC<EditorTabContainerProps> = (props: EditorTabContainerProps) => {
  const {
    baseFilePath,
    filePaths,
    activeEditorTabIndex,
    setActiveEditorTabIndex,
    removeEditorTabByIndex
  } = props;

  const handleHorizontalScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.currentTarget.scrollTo({
      left: e.currentTarget.scrollLeft + e.deltaY
    });
  };

  const relativeFilePaths = filePaths.map(filePath => filePath.replace(baseFilePath, ''));
  const shortenedFilePaths = getShortestUniqueFilePaths(relativeFilePaths);

  return (
    <div className="editor-tab-container" onWheel={handleHorizontalScroll}>
      {shortenedFilePaths.map((filePath, index) => (
        <EditorTab
          key={index}
          filePath={filePath}
          isActive={index === activeEditorTabIndex}
          setActive={() => setActiveEditorTabIndex(index)}
          remove={() => removeEditorTabByIndex(index)}
        />
      ))}
    </div>
  );
};

export default EditorTabContainer;
