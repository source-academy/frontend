import { Card } from '@blueprintjs/core';
import React from 'react';

export type EditorTabProps = {
  filePath: string;
  isActive: boolean;
};

const EditorTab: React.FC<EditorTabProps> = (props: EditorTabProps) => {
  const { filePath } = props;
  return <Card className="editor-tab">{filePath}</Card>;
};

export default EditorTab;
