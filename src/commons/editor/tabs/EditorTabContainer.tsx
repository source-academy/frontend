import React from 'react';

import EditorTab from './EditorTab';

export type EditorTabContainerProps = {
  filePaths: string[];
  activeEditorTabIndex: number;
  setActiveEditorTabIndex: (activeEditorTabIndex: number | null) => void;
};

const EditorTabContainer: React.FC<EditorTabContainerProps> = (props: EditorTabContainerProps) => {
  const { filePaths, activeEditorTabIndex, setActiveEditorTabIndex } = props;

  return (
    <div className="editor-tab-container">
      {filePaths.map((filePath, index) => (
        <EditorTab
          key={index}
          filePath={filePath}
          isActive={index === activeEditorTabIndex}
          setActive={() => setActiveEditorTabIndex(index)}
        />
      ))}
    </div>
  );
};

export default EditorTabContainer;
