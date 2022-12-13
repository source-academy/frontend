import React from 'react';

import Editor, { EditorProps, EditorTabStateProps } from './Editor';

export type EditorContainerProps = Omit<EditorProps, keyof EditorTabStateProps> & {
  editorTabs: EditorTabStateProps[];
};

const EditorContainer: React.FC<EditorContainerProps> = (props: EditorContainerProps) => {
  const { editorTabs, ...editorProps } = props;
  // TODO: Implement editor tabs.
  return <Editor {...editorProps} {...editorTabs[0]}></Editor>;
};

export default EditorContainer;
