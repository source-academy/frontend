import React from 'react';

import EditorTab from './EditorTab';

export type EditorTabContainerProps = {
  filePaths: string[];
  activeEditorTabIndex: number;
};

const EditorTabContainer: React.FC<EditorTabContainerProps> = (props: EditorTabContainerProps) => {
  const { filePaths, activeEditorTabIndex } = props;

  return (
    <div className="editor-tab-container">
      {filePaths.map((filePath, index) => (
        <EditorTab key={index} filePath={filePath} isActive={index === activeEditorTabIndex} />
      ))}
    </div>
  );
};

export default EditorTabContainer;
